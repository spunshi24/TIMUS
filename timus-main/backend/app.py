from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import os
import re
import time
import logging
from collections import OrderedDict
import psycopg2
import psycopg2.extras
import bcrypt
import json
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity,
    verify_jwt_in_request,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=[
    "https://spunshi24.github.io",
    "http://localhost:5173",
    "http://localhost:8080",
])

# ─── JWT config ──────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-secret-change-me")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False  # tokens don't expire
jwt = JWTManager(app)

# ─── Cache ───────────────────────────────────────────────────────────────────
QUOTE_CACHE_DURATION   = 30    # seconds — live prices
HISTORY_CACHE_DURATION = 60    # seconds — chart OHLCV data
INFO_CACHE_DURATION    = 3600  # 1 hour  — company metadata
CACHE_MAX_SIZE         = 500   # entries before LRU eviction

_cache: OrderedDict = OrderedDict()  # key -> (value, expires_at)


def cache_get(key: str):
    entry = _cache.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        _cache.pop(key, None)
        return None
    _cache.move_to_end(key)  # mark as recently used
    return value


def cache_set(key: str, value, ttl: int):
    if key in _cache:
        _cache.move_to_end(key)
    _cache[key] = (value, time.time() + ttl)
    while len(_cache) > CACHE_MAX_SIZE:
        _cache.popitem(last=False)  # evict oldest


# ─── Input validation ─────────────────────────────────────────────────────────
TICKER_RE = re.compile(r"^[A-Z0-9]{1,5}(-[A-Z])?$")


def validate_ticker(t: str) -> bool:
    return bool(t) and bool(TICKER_RE.match(t.upper()))


# ─── Database helpers ────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL")


def get_db():
    return psycopg2.connect(DATABASE_URL)


def init_db():
    """Create tables on first deploy. Called at module load."""
    if not DATABASE_URL:
        return  # local dev without DB — skip silently
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS portfolios (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            balance FLOAT,
            initial_balance FLOAT,
            positions JSONB DEFAULT '[]',
            orders JSONB DEFAULT '[]',
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id)
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS watchlists (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            ticker TEXT NOT NULL,
            name TEXT NOT NULL DEFAULT '',
            added_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, ticker)
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS game_rooms (
            id SERIAL PRIMARY KEY,
            code VARCHAR(8) UNIQUE NOT NULL,
            creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS game_room_members (
            id SERIAL PRIMARY KEY,
            game_room_id INTEGER REFERENCES game_rooms(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            joined_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(game_room_id, user_id)
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

# Curated list of real, actively-traded tickers used for autocomplete search.
# Covers S&P 500 large-caps, popular tech, financials, healthcare, energy, etc.
TICKER_LIST = [
    {"ticker": "AAPL",  "name": "Apple Inc."},
    {"ticker": "MSFT",  "name": "Microsoft Corporation"},
    {"ticker": "GOOGL", "name": "Alphabet Inc. (Class A)"},
    {"ticker": "GOOG",  "name": "Alphabet Inc. (Class C)"},
    {"ticker": "AMZN",  "name": "Amazon.com Inc."},
    {"ticker": "NVDA",  "name": "NVIDIA Corporation"},
    {"ticker": "META",  "name": "Meta Platforms Inc."},
    {"ticker": "TSLA",  "name": "Tesla Inc."},
    {"ticker": "BRK-B", "name": "Berkshire Hathaway Inc."},
    {"ticker": "JPM",   "name": "JPMorgan Chase & Co."},
    {"ticker": "V",     "name": "Visa Inc."},
    {"ticker": "UNH",   "name": "UnitedHealth Group Inc."},
    {"ticker": "LLY",   "name": "Eli Lilly and Company"},
    {"ticker": "JNJ",   "name": "Johnson & Johnson"},
    {"ticker": "XOM",   "name": "Exxon Mobil Corporation"},
    {"ticker": "WMT",   "name": "Walmart Inc."},
    {"ticker": "MA",    "name": "Mastercard Incorporated"},
    {"ticker": "PG",    "name": "Procter & Gamble Co."},
    {"ticker": "AVGO",  "name": "Broadcom Inc."},
    {"ticker": "HD",    "name": "The Home Depot Inc."},
    {"ticker": "CVX",   "name": "Chevron Corporation"},
    {"ticker": "ABBV",  "name": "AbbVie Inc."},
    {"ticker": "MRK",   "name": "Merck & Co. Inc."},
    {"ticker": "COST",  "name": "Costco Wholesale Corporation"},
    {"ticker": "KO",    "name": "The Coca-Cola Company"},
    {"ticker": "BAC",   "name": "Bank of America Corporation"},
    {"ticker": "PEP",   "name": "PepsiCo Inc."},
    {"ticker": "MCD",   "name": "McDonald's Corporation"},
    {"ticker": "TMO",   "name": "Thermo Fisher Scientific Inc."},
    {"ticker": "CSCO",  "name": "Cisco Systems Inc."},
    {"ticker": "ACN",   "name": "Accenture plc"},
    {"ticker": "WFC",   "name": "Wells Fargo & Company"},
    {"ticker": "ABT",   "name": "Abbott Laboratories"},
    {"ticker": "NFLX",  "name": "Netflix Inc."},
    {"ticker": "AMD",   "name": "Advanced Micro Devices Inc."},
    {"ticker": "LIN",   "name": "Linde plc"},
    {"ticker": "ADBE",  "name": "Adobe Inc."},
    {"ticker": "TXN",   "name": "Texas Instruments Incorporated"},
    {"ticker": "AMGN",  "name": "Amgen Inc."},
    {"ticker": "PM",    "name": "Philip Morris International Inc."},
    {"ticker": "NEE",   "name": "NextEra Energy Inc."},
    {"ticker": "INTC",  "name": "Intel Corporation"},
    {"ticker": "IBM",   "name": "IBM Corporation"},
    {"ticker": "QCOM",  "name": "Qualcomm Incorporated"},
    {"ticker": "DIS",   "name": "The Walt Disney Company"},
    {"ticker": "GE",    "name": "GE Aerospace"},
    {"ticker": "CAT",   "name": "Caterpillar Inc."},
    {"ticker": "BA",    "name": "The Boeing Company"},
    {"ticker": "GS",    "name": "The Goldman Sachs Group Inc."},
    {"ticker": "MS",    "name": "Morgan Stanley"},
    {"ticker": "RTX",   "name": "RTX Corporation"},
    {"ticker": "PYPL",  "name": "PayPal Holdings Inc."},
    {"ticker": "BKNG",  "name": "Booking Holdings Inc."},
    {"ticker": "SBUX",  "name": "Starbucks Corporation"},
    {"ticker": "NOW",   "name": "ServiceNow Inc."},
    {"ticker": "SNOW",  "name": "Snowflake Inc."},
    {"ticker": "UBER",  "name": "Uber Technologies Inc."},
    {"ticker": "ABNB",  "name": "Airbnb Inc."},
    {"ticker": "SHOP",  "name": "Shopify Inc."},
    {"ticker": "SQ",    "name": "Block Inc."},
    {"ticker": "PLTR",  "name": "Palantir Technologies Inc."},
    {"ticker": "RIVN",  "name": "Rivian Automotive Inc."},
    {"ticker": "F",     "name": "Ford Motor Company"},
    {"ticker": "GM",    "name": "General Motors Company"},
    {"ticker": "T",     "name": "AT&T Inc."},
    {"ticker": "VZ",    "name": "Verizon Communications Inc."},
    {"ticker": "CMCSA", "name": "Comcast Corporation"},
    {"ticker": "C",     "name": "Citigroup Inc."},
    {"ticker": "AXP",   "name": "American Express Company"},
    {"ticker": "BLK",   "name": "BlackRock Inc."},
    {"ticker": "SCHW",  "name": "The Charles Schwab Corporation"},
    {"ticker": "CRM",   "name": "Salesforce Inc."},
    {"ticker": "ORCL",  "name": "Oracle Corporation"},
    {"ticker": "HON",   "name": "Honeywell International Inc."},
    {"ticker": "UPS",   "name": "United Parcel Service Inc."},
    {"ticker": "FDX",   "name": "FedEx Corporation"},
    {"ticker": "LMT",   "name": "Lockheed Martin Corporation"},
    {"ticker": "PFE",   "name": "Pfizer Inc."},
    {"ticker": "GILD",  "name": "Gilead Sciences Inc."},
    {"ticker": "BMY",   "name": "Bristol-Myers Squibb Company"},
    {"ticker": "CVS",   "name": "CVS Health Corporation"},
    {"ticker": "SPGI",  "name": "S&P Global Inc."},
    {"ticker": "MMM",   "name": "3M Company"},
    {"ticker": "DHR",   "name": "Danaher Corporation"},
    {"ticker": "MO",    "name": "Altria Group Inc."},
    {"ticker": "MDT",   "name": "Medtronic plc"},
    {"ticker": "AMT",   "name": "American Tower Corporation"},
    {"ticker": "CI",    "name": "The Cigna Group"},
    {"ticker": "DE",    "name": "Deere & Company"},
    {"ticker": "ELV",   "name": "Elevance Health Inc."},
    {"ticker": "SO",    "name": "The Southern Company"},
    {"ticker": "DUK",   "name": "Duke Energy Corporation"},
    {"ticker": "COP",   "name": "ConocoPhillips"},
    {"ticker": "SLB",   "name": "Schlumberger Limited"},
    {"ticker": "ETN",   "name": "Eaton Corporation plc"},
    {"ticker": "APD",   "name": "Air Products and Chemicals Inc."},
    {"ticker": "ZTS",   "name": "Zoetis Inc."},
    {"ticker": "BSX",   "name": "Boston Scientific Corporation"},
    {"ticker": "ISRG",  "name": "Intuitive Surgical Inc."},
    {"ticker": "REGN",  "name": "Regeneron Pharmaceuticals Inc."},
    {"ticker": "VRTX",  "name": "Vertex Pharmaceuticals Incorporated"},
    {"ticker": "MRNA",  "name": "Moderna Inc."},
    {"ticker": "DXCM",  "name": "DexCom Inc."},
    {"ticker": "PANW",  "name": "Palo Alto Networks Inc."},
    {"ticker": "CRWD",  "name": "CrowdStrike Holdings Inc."},
    {"ticker": "ZS",    "name": "Zscaler Inc."},
    {"ticker": "OKTA",  "name": "Okta Inc."},
    {"ticker": "NET",   "name": "Cloudflare Inc."},
    {"ticker": "DDOG",  "name": "Datadog Inc."},
    {"ticker": "MDB",   "name": "MongoDB Inc."},
    {"ticker": "TTD",   "name": "The Trade Desk Inc."},
    {"ticker": "RBLX",  "name": "Roblox Corporation"},
    {"ticker": "COIN",  "name": "Coinbase Global Inc."},
    {"ticker": "MSTR",  "name": "MicroStrategy Incorporated"},
    {"ticker": "ARM",   "name": "Arm Holdings plc"},
    {"ticker": "SMCI",  "name": "Super Micro Computer Inc."},
    {"ticker": "CEG",   "name": "Constellation Energy Corporation"},
    {"ticker": "VST",   "name": "Vistra Corp."},
    {"ticker": "NRG",   "name": "NRG Energy Inc."},
    {"ticker": "SPY",   "name": "SPDR S&P 500 ETF Trust"},
    {"ticker": "QQQ",   "name": "Invesco QQQ Trust (Nasdaq-100)"},
    {"ticker": "IWM",   "name": "iShares Russell 2000 ETF"},
    {"ticker": "DIA",   "name": "SPDR Dow Jones Industrial Average ETF"},
    {"ticker": "GLD",   "name": "SPDR Gold Shares ETF"},
    {"ticker": "SLV",   "name": "iShares Silver Trust ETF"},
    {"ticker": "USO",   "name": "United States Oil Fund LP"},
    {"ticker": "TLT",   "name": "iShares 20+ Year Treasury Bond ETF"},
    {"ticker": "VTI",   "name": "Vanguard Total Stock Market ETF"},
    {"ticker": "VOO",   "name": "Vanguard S&P 500 ETF"},
    # ── Tech / Internet ──────────────────────────────────────────────────────
    {"ticker": "SPOT",  "name": "Spotify Technology S.A."},
    {"ticker": "ZM",    "name": "Zoom Video Communications Inc."},
    {"ticker": "SNAP",  "name": "Snap Inc."},
    {"ticker": "PINS",  "name": "Pinterest Inc."},
    {"ticker": "LYFT",  "name": "Lyft Inc."},
    {"ticker": "DASH",  "name": "DoorDash Inc."},
    {"ticker": "ROKU",  "name": "Roku Inc."},
    {"ticker": "TWLO",  "name": "Twilio Inc."},
    {"ticker": "HUBS",  "name": "HubSpot Inc."},
    {"ticker": "ZI",    "name": "ZoomInfo Technologies Inc."},
    {"ticker": "DOCU",  "name": "DocuSign Inc."},
    {"ticker": "PATH",  "name": "UiPath Inc."},
    {"ticker": "U",     "name": "Unity Software Inc."},
    {"ticker": "AI",    "name": "C3.ai Inc."},
    {"ticker": "BILL",  "name": "Bill.com Holdings Inc."},
    {"ticker": "MNDY",  "name": "monday.com Ltd."},
    {"ticker": "CFLT",  "name": "Confluent Inc."},
    {"ticker": "GTLB",  "name": "GitLab Inc."},
    {"ticker": "SMAR",  "name": "Smartsheet Inc."},
    {"ticker": "ESTC",  "name": "Elastic N.V."},
    {"ticker": "GDDY",  "name": "GoDaddy Inc."},
    {"ticker": "WIX",   "name": "Wix.com Ltd."},
    {"ticker": "ETSY",  "name": "Etsy Inc."},
    {"ticker": "EBAY",  "name": "eBay Inc."},
    {"ticker": "MELI",  "name": "MercadoLibre Inc."},
    {"ticker": "SE",    "name": "Sea Limited"},
    {"ticker": "GRAB",  "name": "Grab Holdings Ltd."},
    {"ticker": "FTNT",  "name": "Fortinet Inc."},
    {"ticker": "S",     "name": "SentinelOne Inc."},
    {"ticker": "CYBR",  "name": "CyberArk Software Ltd."},
    {"ticker": "TENB",  "name": "Tenable Holdings Inc."},
    {"ticker": "FSLY",  "name": "Fastly Inc."},
    # ── Fintech / Finance ────────────────────────────────────────────────────
    {"ticker": "SOFI",  "name": "SoFi Technologies Inc."},
    {"ticker": "HOOD",  "name": "Robinhood Markets Inc."},
    {"ticker": "AFRM",  "name": "Affirm Holdings Inc."},
    {"ticker": "UPST",  "name": "Upstart Holdings Inc."},
    {"ticker": "OPEN",  "name": "Opendoor Technologies Inc."},
    {"ticker": "RKT",   "name": "Rocket Companies Inc."},
    {"ticker": "ALLY",  "name": "Ally Financial Inc."},
    {"ticker": "COF",   "name": "Capital One Financial Corporation"},
    {"ticker": "DFS",   "name": "Discover Financial Services"},
    {"ticker": "SLM",   "name": "SLM Corporation (Sallie Mae)"},
    {"ticker": "FITB",  "name": "Fifth Third Bancorp"},
    {"ticker": "KEY",   "name": "KeyCorp"},
    {"ticker": "RF",    "name": "Regions Financial Corporation"},
    {"ticker": "HBAN",  "name": "Huntington Bancshares Inc."},
    {"ticker": "USB",   "name": "U.S. Bancorp"},
    {"ticker": "PNC",   "name": "PNC Financial Services Group"},
    {"ticker": "MTB",   "name": "M&T Bank Corporation"},
    {"ticker": "CFG",   "name": "Citizens Financial Group Inc."},
    {"ticker": "NTRS",  "name": "Northern Trust Corporation"},
    {"ticker": "STT",   "name": "State Street Corporation"},
    {"ticker": "NDAQ",  "name": "Nasdaq Inc."},
    {"ticker": "ICE",   "name": "Intercontinental Exchange Inc."},
    {"ticker": "CME",   "name": "CME Group Inc."},
    {"ticker": "CBOE",  "name": "Cboe Global Markets Inc."},
    # ── EV / Auto ────────────────────────────────────────────────────────────
    {"ticker": "LCID",  "name": "Lucid Group Inc."},
    {"ticker": "NIO",   "name": "NIO Inc."},
    {"ticker": "LI",    "name": "Li Auto Inc."},
    {"ticker": "XPEV",  "name": "XPeng Inc."},
    # ── Consumer / Retail ────────────────────────────────────────────────────
    {"ticker": "NKE",   "name": "Nike Inc."},
    {"ticker": "LULU",  "name": "Lululemon Athletica Inc."},
    {"ticker": "TGT",   "name": "Target Corporation"},
    {"ticker": "LOW",   "name": "Lowe's Companies Inc."},
    {"ticker": "TJX",   "name": "TJX Companies Inc."},
    {"ticker": "ROST",  "name": "Ross Stores Inc."},
    {"ticker": "GPS",   "name": "Gap Inc."},
    {"ticker": "URBN",  "name": "Urban Outfitters Inc."},
    {"ticker": "DECK",  "name": "Deckers Outdoor Corporation"},
    {"ticker": "CROX",  "name": "Crocs Inc."},
    {"ticker": "VFC",   "name": "VF Corporation"},
    {"ticker": "RL",    "name": "Ralph Lauren Corporation"},
    {"ticker": "PVH",   "name": "PVH Corp."},
    {"ticker": "HBI",   "name": "Hanesbrands Inc."},
    {"ticker": "COLM",  "name": "Columbia Sportswear Company"},
    # ── Gaming / Media / Entertainment ──────────────────────────────────────
    {"ticker": "EA",    "name": "Electronic Arts Inc."},
    {"ticker": "TTWO",  "name": "Take-Two Interactive Software Inc."},
    {"ticker": "RBLX",  "name": "Roblox Corporation"},
    {"ticker": "PARA",  "name": "Paramount Global"},
    {"ticker": "WBD",   "name": "Warner Bros. Discovery Inc."},
    {"ticker": "NWSA",  "name": "News Corp (Class A)"},
    {"ticker": "FOX",   "name": "Fox Corporation (Class B)"},
    {"ticker": "FOXA",  "name": "Fox Corporation (Class A)"},
    {"ticker": "FUBO",  "name": "fuboTV Inc."},
    {"ticker": "GME",   "name": "GameStop Corp."},
    {"ticker": "AMC",   "name": "AMC Entertainment Holdings Inc."},
    # ── Gaming / Casinos / Sports Betting ────────────────────────────────────
    {"ticker": "DKNG",  "name": "DraftKings Inc."},
    {"ticker": "PENN",  "name": "PENN Entertainment Inc."},
    {"ticker": "WYNN",  "name": "Wynn Resorts Ltd."},
    {"ticker": "LVS",   "name": "Las Vegas Sands Corp."},
    {"ticker": "MGM",   "name": "MGM Resorts International"},
    {"ticker": "CZR",   "name": "Caesars Entertainment Inc."},
    # ── Travel / Hospitality / Airlines ──────────────────────────────────────
    {"ticker": "DAL",   "name": "Delta Air Lines Inc."},
    {"ticker": "UAL",   "name": "United Airlines Holdings Inc."},
    {"ticker": "AAL",   "name": "American Airlines Group Inc."},
    {"ticker": "LUV",   "name": "Southwest Airlines Co."},
    {"ticker": "JBLU",  "name": "JetBlue Airways Corporation"},
    {"ticker": "ALK",   "name": "Alaska Air Group Inc."},
    {"ticker": "NCLH",  "name": "Norwegian Cruise Line Holdings Ltd."},
    {"ticker": "RCL",   "name": "Royal Caribbean Cruises Ltd."},
    {"ticker": "CCL",   "name": "Carnival Corporation & plc"},
    {"ticker": "MAR",   "name": "Marriott International Inc."},
    {"ticker": "HLT",   "name": "Hilton Worldwide Holdings Inc."},
    {"ticker": "H",     "name": "Hyatt Hotels Corporation"},
    {"ticker": "EXPE",  "name": "Expedia Group Inc."},
    # ── Healthcare / Biotech ─────────────────────────────────────────────────
    {"ticker": "BIIB",  "name": "Biogen Inc."},
    {"ticker": "ILMN",  "name": "Illumina Inc."},
    {"ticker": "IDXX",  "name": "IDEXX Laboratories Inc."},
    {"ticker": "ALGN",  "name": "Align Technology Inc."},
    {"ticker": "PODD",  "name": "Insulet Corporation"},
    {"ticker": "EW",    "name": "Edwards Lifesciences Corporation"},
    {"ticker": "RMD",   "name": "ResMed Inc."},
    {"ticker": "STE",   "name": "STERIS plc"},
    {"ticker": "BAX",   "name": "Baxter International Inc."},
    {"ticker": "BDX",   "name": "Becton Dickinson and Company"},
    {"ticker": "HOLX",  "name": "Hologic Inc."},
    {"ticker": "ALNY",  "name": "Alnylam Pharmaceuticals Inc."},
    {"ticker": "INCY",  "name": "Incyte Corporation"},
    {"ticker": "EXAS",  "name": "Exact Sciences Corporation"},
    {"ticker": "NVAX",  "name": "Novavax Inc."},
    {"ticker": "BNTX",  "name": "BioNTech SE"},
    {"ticker": "ARWR",  "name": "Arrowhead Pharmaceuticals Inc."},
    # ── Energy / Commodities ─────────────────────────────────────────────────
    {"ticker": "OXY",   "name": "Occidental Petroleum Corporation"},
    {"ticker": "PXD",   "name": "Pioneer Natural Resources Company"},
    {"ticker": "DVN",   "name": "Devon Energy Corporation"},
    {"ticker": "FANG",  "name": "Diamondback Energy Inc."},
    {"ticker": "MPC",   "name": "Marathon Petroleum Corporation"},
    {"ticker": "PSX",   "name": "Phillips 66"},
    {"ticker": "VLO",   "name": "Valero Energy Corporation"},
    {"ticker": "HES",   "name": "Hess Corporation"},
    {"ticker": "APA",   "name": "APA Corporation"},
    {"ticker": "HAL",   "name": "Halliburton Company"},
    {"ticker": "BKR",   "name": "Baker Hughes Company"},
    {"ticker": "OKE",   "name": "ONEOK Inc."},
    {"ticker": "KMI",   "name": "Kinder Morgan Inc."},
    {"ticker": "WMB",   "name": "Williams Companies Inc."},
    {"ticker": "ET",    "name": "Energy Transfer LP"},
    # ── Real Estate / REITs ───────────────────────────────────────────────────
    {"ticker": "PLD",   "name": "Prologis Inc."},
    {"ticker": "EQIX",  "name": "Equinix Inc."},
    {"ticker": "DLR",   "name": "Digital Realty Trust Inc."},
    {"ticker": "O",     "name": "Realty Income Corporation"},
    {"ticker": "CCI",   "name": "Crown Castle Inc."},
    {"ticker": "AMT",   "name": "American Tower Corporation"},
    {"ticker": "SBAC",  "name": "SBA Communications Corporation"},
    {"ticker": "IRM",   "name": "Iron Mountain Inc."},
    {"ticker": "WPC",   "name": "W. P. Carey Inc."},
    {"ticker": "STAG",  "name": "STAG Industrial Inc."},
    {"ticker": "NNN",   "name": "NNN REIT Inc."},
    {"ticker": "AVB",   "name": "AvalonBay Communities Inc."},
    {"ticker": "EQR",   "name": "Equity Residential"},
    # ── Homebuilders ─────────────────────────────────────────────────────────
    {"ticker": "DHI",   "name": "D.R. Horton Inc."},
    {"ticker": "LEN",   "name": "Lennar Corporation"},
    {"ticker": "PHM",   "name": "PulteGroup Inc."},
    {"ticker": "TOL",   "name": "Toll Brothers Inc."},
    {"ticker": "KBH",   "name": "KB Home"},
    {"ticker": "NVR",   "name": "NVR Inc."},
    # ── Industrial / Defense / Aerospace ─────────────────────────────────────
    {"ticker": "NOC",   "name": "Northrop Grumman Corporation"},
    {"ticker": "GD",    "name": "General Dynamics Corporation"},
    {"ticker": "L3H",   "name": "L3Harris Technologies Inc."},
    {"ticker": "HII",   "name": "Huntington Ingalls Industries Inc."},
    {"ticker": "TDG",   "name": "TransDigm Group Inc."},
    {"ticker": "SPCE",  "name": "Virgin Galactic Holdings Inc."},
    {"ticker": "RHM",   "name": "Rheinmetall AG"},
    # ── Crypto-adjacent ───────────────────────────────────────────────────────
    {"ticker": "HUT",   "name": "Hut 8 Corp."},
    {"ticker": "CLSK",  "name": "CleanSpark Inc."},
    {"ticker": "BTBT",  "name": "Bit Digital Inc."},
    {"ticker": "BITF",  "name": "Bitfarms Ltd."},
    {"ticker": "RIOT",  "name": "Riot Platforms Inc."},
    {"ticker": "MARA",  "name": "Marathon Digital Holdings Inc."},
    # ── Popular leveraged / inverse ETFs ─────────────────────────────────────
    {"ticker": "TQQQ",  "name": "ProShares UltraPro QQQ (3x)"},
    {"ticker": "SQQQ",  "name": "ProShares UltraPro Short QQQ (3x inverse)"},
    {"ticker": "SPXL",  "name": "Direxion Daily S&P 500 Bull 3x"},
    {"ticker": "SPXS",  "name": "Direxion Daily S&P 500 Bear 3x"},
    {"ticker": "ARKK",  "name": "ARK Innovation ETF"},
    {"ticker": "ARKG",  "name": "ARK Genomic Revolution ETF"},
    {"ticker": "JETS",  "name": "U.S. Global Jets ETF"},
    {"ticker": "XLF",   "name": "Financial Select Sector SPDR ETF"},
    {"ticker": "XLK",   "name": "Technology Select Sector SPDR ETF"},
    {"ticker": "XLE",   "name": "Energy Select Sector SPDR ETF"},
    {"ticker": "XLV",   "name": "Health Care Select Sector SPDR ETF"},
    {"ticker": "XLI",   "name": "Industrial Select Sector SPDR ETF"},
    {"ticker": "XLRE",  "name": "Real Estate Select Sector SPDR ETF"},
]

# Build an index: ticker -> name, for fast lookup in search
TICKER_INDEX = {t["ticker"]: t["name"] for t in TICKER_LIST}


def format_market_cap(market_cap):
    if not market_cap:
        return "N/A"
    if market_cap >= 1e12:
        return f"{market_cap / 1e12:.2f}T"
    if market_cap >= 1e9:
        return f"{market_cap / 1e9:.2f}B"
    if market_cap >= 1e6:
        return f"{market_cap / 1e6:.2f}M"
    return str(market_cap)


def safe_float(value, digits=2):
    try:
        return round(float(value), digits) if value is not None else None
    except (TypeError, ValueError):
        return None


@app.route("/api/quote/<ticker>")
def get_quote(ticker):
    """
    Returns real-time quote data for a ticker from Yahoo Finance.
    Falls back gracefully if certain fields are missing.
    """
    ticker = ticker.upper().strip()
    if not validate_ticker(ticker):
        return jsonify({"error": "Invalid ticker symbol."}), 400

    cache_key = f"quote:{ticker}"
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify(cached)

    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        # Yahoo Finance returns an empty/minimal dict for invalid tickers
        if not info or info.get("quoteType") is None:
            return jsonify({"error": f"Ticker '{ticker}' not found or invalid."}), 404

        # Current price: try several field names Yahoo uses depending on market hours
        current_price = (
            info.get("currentPrice")
            or info.get("regularMarketPrice")
            or info.get("ask")
            or info.get("navPrice")
        )

        # If still None (pre/after-hours or ETF), fall back to recent history
        if current_price is None:
            hist = stock.history(period="5d", interval="1d")
            if not hist.empty:
                current_price = float(hist["Close"].iloc[-1])
            else:
                return jsonify({"error": f"No price data available for '{ticker}'."}), 404

        prev_close = (
            info.get("previousClose")
            or info.get("regularMarketPreviousClose")
            or current_price
        )

        change = float(current_price) - float(prev_close)
        change_pct = (change / float(prev_close) * 100) if prev_close else 0

        # yfinance returns dividendYield as a decimal fraction (0.0046 = 0.46%).
        # Multiply by 100 to get percentage. Cap at 25% to filter data errors.
        raw_yield = info.get("dividendYield") or 0
        div_yield_pct = round(float(raw_yield) * 100, 2)
        if div_yield_pct > 25:
            div_yield_pct = None  # almost certainly a data error

        result = {
            "ticker": ticker,
            "name": info.get("longName") or info.get("shortName") or TICKER_INDEX.get(ticker, ticker),
            "price": safe_float(current_price),
            "change": safe_float(change),
            "change_pct": safe_float(change_pct, 4),
            "volume": info.get("volume") or info.get("regularMarketVolume") or 0,
            "open": safe_float(info.get("open") or info.get("regularMarketOpen") or current_price),
            "high": safe_float(info.get("dayHigh") or info.get("regularMarketDayHigh") or current_price),
            "low": safe_float(info.get("dayLow") or info.get("regularMarketDayLow") or current_price),
            "prev_close": safe_float(prev_close),
            "market_cap": format_market_cap(info.get("marketCap")),
            "pe_ratio": safe_float(info.get("trailingPE")),
            "beta": safe_float(info.get("beta")),
            "week52_high": safe_float(info.get("fiftyTwoWeekHigh")),
            "week52_low": safe_float(info.get("fiftyTwoWeekLow")),
            "dividend_yield": div_yield_pct,
        }
        cache_set(cache_key, result, QUOTE_CACHE_DURATION)
        return jsonify(result)
    except Exception as e:
        logger.error("get_quote %s: %s", ticker, e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/history/<ticker>")
def get_history(ticker):
    """
    Returns OHLCV candle history for charting.
    Defaults to today's intraday data (1d / 5m bars).
    Automatically falls back to a longer period if today's session has no data
    (e.g. weekend, holiday).
    """
    ticker = ticker.upper().strip()
    if not validate_ticker(ticker):
        return jsonify({"error": "Invalid ticker symbol."}), 400

    period = request.args.get("period", "1d")
    interval = request.args.get("interval", "5m")

    cache_key = f"history:{ticker}:{period}:{interval}"
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify(cached)

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval=interval)

        # If today's intraday is empty (market closed / weekend), fall back to 5d/30m
        if hist.empty and period == "1d":
            hist = stock.history(period="5d", interval="30m")

        # Final fallback: last 30 days of daily data
        if hist.empty:
            hist = stock.history(period="1mo", interval="1d")

        if hist.empty:
            return jsonify({"error": f"No historical data found for '{ticker}'."}), 404

        data = []
        for idx, row in hist.iterrows():
            data.append({
                "time": idx.isoformat(),
                "open": safe_float(row["Open"]),
                "high": safe_float(row["High"]),
                "low": safe_float(row["Low"]),
                "close": safe_float(row["Close"]),
                "volume": int(row["Volume"]),
            })

        result = {"ticker": ticker, "data": data}
        cache_set(cache_key, result, HISTORY_CACHE_DURATION)
        return jsonify(result)
    except Exception as e:
        logger.error("get_history %s: %s", ticker, e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/search")
def search_tickers():
    """
    Autocomplete endpoint. Searches both ticker symbols and company names.
    Falls back to yfinance lookup for tickers not in the local list.
    Returns up to 10 matches.
    """
    query = request.args.get("q", "").upper().strip()
    if not query:
        return jsonify([])

    results = []
    for t in TICKER_LIST:
        if query in t["ticker"] or query in t["name"].upper():
            results.append(t)
        if len(results) >= 10:
            break

    # yfinance fallback: if no local hits and query looks like a ticker symbol,
    # try to resolve it directly so any valid US ticker works.
    if not results and re.match(r'^[A-Z0-9\.\-]{1,7}$', query):
        try:
            ticker_obj = yf.Ticker(query)
            info = ticker_obj.info or {}
            long_name = info.get("longName") or info.get("shortName")
            if long_name:
                results.append({"ticker": query, "name": long_name})
        except Exception:
            pass

    return jsonify(results)


# ─── Auth routes ─────────────────────────────────────────────────────────────

@app.route("/api/auth/register", methods=["POST"])
def register():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id, username, email",
            (username, email, password_hash),
        )
        user = dict(cur.fetchone())
        conn.commit()
        cur.close()
        conn.close()
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "Username or email already in use"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    token = create_access_token(identity=str(user["id"]))
    return jsonify({"token": token, "user": {"username": user["username"], "email": user["email"]}}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401
    token = create_access_token(identity=str(user["id"]))
    return jsonify({"token": token, "user": {"username": user["username"], "email": user["email"]}})


# ─── Portfolio routes ─────────────────────────────────────────────────────────

@app.route("/api/portfolio/load", methods=["GET"])
@jwt_required()
def load_portfolio():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    user_id = int(get_jwt_identity())
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM portfolios WHERE user_id = %s", (user_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    if not row:
        return jsonify({"found": False})
    return jsonify({
        "found": True,
        "balance": row["balance"],
        "initialBalance": row["initial_balance"],
        "positions": row["positions"],
        "orders": row["orders"],
    })


@app.route("/api/portfolio/save", methods=["POST"])
@jwt_required()
def save_portfolio():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    balance = data.get("balance", 100000)
    initial_balance = data.get("initialBalance", 100000)
    positions = json.dumps(data.get("positions", []))
    orders = json.dumps(data.get("orders", []))
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO portfolios (user_id, balance, initial_balance, positions, orders, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                balance = EXCLUDED.balance,
                initial_balance = EXCLUDED.initial_balance,
                positions = EXCLUDED.positions,
                orders = EXCLUDED.orders,
                updated_at = NOW()
        """, (user_id, balance, initial_balance, positions, orders))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"ok": True})


# ─── Top 50 by market cap (static list, prices fetched by frontend) ───────────

TOP_50 = [
    {"ticker": "AAPL",  "name": "Apple Inc."},
    {"ticker": "MSFT",  "name": "Microsoft Corporation"},
    {"ticker": "NVDA",  "name": "NVIDIA Corporation"},
    {"ticker": "GOOGL", "name": "Alphabet Inc. (Class A)"},
    {"ticker": "AMZN",  "name": "Amazon.com Inc."},
    {"ticker": "META",  "name": "Meta Platforms Inc."},
    {"ticker": "TSLA",  "name": "Tesla Inc."},
    {"ticker": "BRK-B", "name": "Berkshire Hathaway Inc."},
    {"ticker": "LLY",   "name": "Eli Lilly and Company"},
    {"ticker": "AVGO",  "name": "Broadcom Inc."},
    {"ticker": "JPM",   "name": "JPMorgan Chase & Co."},
    {"ticker": "V",     "name": "Visa Inc."},
    {"ticker": "UNH",   "name": "UnitedHealth Group Inc."},
    {"ticker": "XOM",   "name": "Exxon Mobil Corporation"},
    {"ticker": "WMT",   "name": "Walmart Inc."},
    {"ticker": "MA",    "name": "Mastercard Incorporated"},
    {"ticker": "COST",  "name": "Costco Wholesale Corporation"},
    {"ticker": "PG",    "name": "Procter & Gamble Co."},
    {"ticker": "JNJ",   "name": "Johnson & Johnson"},
    {"ticker": "HD",    "name": "The Home Depot Inc."},
    {"ticker": "ABBV",  "name": "AbbVie Inc."},
    {"ticker": "ORCL",  "name": "Oracle Corporation"},
    {"ticker": "CVX",   "name": "Chevron Corporation"},
    {"ticker": "MRK",   "name": "Merck & Co. Inc."},
    {"ticker": "BAC",   "name": "Bank of America Corporation"},
    {"ticker": "KO",    "name": "The Coca-Cola Company"},
    {"ticker": "PEP",   "name": "PepsiCo Inc."},
    {"ticker": "TMO",   "name": "Thermo Fisher Scientific Inc."},
    {"ticker": "ACN",   "name": "Accenture plc"},
    {"ticker": "CSCO",  "name": "Cisco Systems Inc."},
    {"ticker": "MCD",   "name": "McDonald's Corporation"},
    {"ticker": "WFC",   "name": "Wells Fargo & Company"},
    {"ticker": "ABT",   "name": "Abbott Laboratories"},
    {"ticker": "NFLX",  "name": "Netflix Inc."},
    {"ticker": "NOW",   "name": "ServiceNow Inc."},
    {"ticker": "AMD",   "name": "Advanced Micro Devices Inc."},
    {"ticker": "LIN",   "name": "Linde plc"},
    {"ticker": "ADBE",  "name": "Adobe Inc."},
    {"ticker": "AMGN",  "name": "Amgen Inc."},
    {"ticker": "PM",    "name": "Philip Morris International Inc."},
    {"ticker": "GE",    "name": "GE Aerospace"},
    {"ticker": "ISRG",  "name": "Intuitive Surgical Inc."},
    {"ticker": "TXN",   "name": "Texas Instruments Incorporated"},
    {"ticker": "CAT",   "name": "Caterpillar Inc."},
    {"ticker": "QCOM",  "name": "Qualcomm Incorporated"},
    {"ticker": "GS",    "name": "The Goldman Sachs Group Inc."},
    {"ticker": "CRM",   "name": "Salesforce Inc."},
    {"ticker": "DIS",   "name": "The Walt Disney Company"},
    {"ticker": "INTC",  "name": "Intel Corporation"},
    {"ticker": "IBM",   "name": "IBM Corporation"},
]


@app.route("/api/top50", methods=["GET"])
def get_top50():
    """Returns the top 50 companies by market cap (names only; prices fetched by frontend)."""
    return jsonify(TOP_50)


# ─── Watchlist routes ─────────────────────────────────────────────────────────

@app.route("/api/watchlist", methods=["GET"])
@jwt_required()
def get_watchlist():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    user_id = int(get_jwt_identity())
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT ticker, name, added_at FROM watchlists WHERE user_id = %s ORDER BY added_at ASC",
            (user_id,)
        )
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/watchlist/add", methods=["POST"])
@jwt_required()
def add_to_watchlist():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    ticker = (data.get("ticker") or "").upper().strip()
    name = (data.get("name") or ticker).strip()
    if not ticker:
        return jsonify({"error": "ticker is required"}), 400
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO watchlists (user_id, ticker, name) VALUES (%s, %s, %s) ON CONFLICT (user_id, ticker) DO NOTHING",
            (user_id, ticker, name)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True, "ticker": ticker})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/watchlist/remove", methods=["DELETE"])
@jwt_required()
def remove_from_watchlist():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    ticker = (data.get("ticker") or "").upper().strip()
    if not ticker:
        return jsonify({"error": "ticker is required"}), 400
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM watchlists WHERE user_id = %s AND ticker = %s",
            (user_id, ticker)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Game Room routes ─────────────────────────────────────────────────────────

@app.route("/api/gameroom/create", methods=["POST"])
@jwt_required()
def create_game_room():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    code = (data.get("code") or "").upper().strip()
    if not code:
        return jsonify({"error": "code is required"}), 400
    if len(code) != 8:
        return jsonify({"error": "Code must be exactly 8 characters"}), 400
    if not re.match(r'^[A-Z0-9]{8}$', code):
        return jsonify({"error": "Code must contain only letters and numbers"}), 400
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "INSERT INTO game_rooms (code, creator_id) VALUES (%s, %s) RETURNING id, code",
            (code, user_id)
        )
        room = dict(cur.fetchone())
        cur.execute(
            "INSERT INTO game_room_members (game_room_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (room["id"], user_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True, "code": room["code"]}), 201
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "That game code is already taken. Please choose a different one."}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/gameroom/join", methods=["POST"])
@jwt_required()
def join_game_room():
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    code = (data.get("code") or "").upper().strip()
    if not code:
        return jsonify({"error": "code is required"}), 400
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, code FROM game_rooms WHERE code = %s", (code,))
        room = cur.fetchone()
        if not room:
            cur.close()
            conn.close()
            return jsonify({"error": "Game room not found. Check your code and try again."}), 404
        room = dict(room)
        cur.execute(
            "INSERT INTO game_room_members (game_room_id, user_id) VALUES (%s, %s) ON CONFLICT (game_room_id, user_id) DO NOTHING",
            (room["id"], user_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True, "code": room["code"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Game Room leaderboard & details ─────────────────────────────────────────

@app.route("/api/gameroom/<code>/leaderboard", methods=["GET"])
def gameroom_leaderboard(code):
    """
    Public leaderboard for a game room. No JWT required so it can be projected.
    If a valid JWT is provided, the response includes `requesting_user_id` so the
    frontend can highlight the current user's row.
    """
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503

    # Optionally identify the requesting user (no error if missing)
    requesting_user_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            requesting_user_id = int(identity)
    except Exception:
        pass

    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Verify room exists
        cur.execute("SELECT id FROM game_rooms WHERE code = %s", (code.upper(),))
        room = cur.fetchone()
        if not room:
            cur.close()
            conn.close()
            return jsonify({"error": "Game room not found"}), 404

        # Get all members with their portfolios
        cur.execute("""
            SELECT u.id AS user_id, u.username,
                   p.balance, p.initial_balance, p.positions
            FROM game_room_members grm
            JOIN users u ON u.id = grm.user_id
            LEFT JOIN portfolios p ON p.user_id = u.id
            WHERE grm.game_room_id = %s
        """, (room["id"],))
        members = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        logger.error("leaderboard %s: %s", code, e)
        return jsonify({"leaderboard": [], "requesting_user_id": requesting_user_id, "error": str(e)}), 200

    # Build leaderboard entries — wrapped so price-fetch crashes can't kill the endpoint
    try:
        entries = []
        # Collect all unique tickers held by any member
        all_tickers = set()
        member_data = []
        for m in members:
            positions = m.get("positions") or []
            if isinstance(positions, str):
                try:
                    positions = json.loads(positions)
                except Exception:
                    positions = []
            if not isinstance(positions, list):
                positions = []
            tickers = {p["ticker"] for p in positions if isinstance(p, dict) and "ticker" in p}
            all_tickers.update(tickers)
            balance = 100000.0
            initial_balance = 100000.0
            try:
                balance = float(m["balance"]) if m.get("balance") is not None else 100000.0
            except (TypeError, ValueError):
                pass
            try:
                initial_balance = float(m["initial_balance"]) if m.get("initial_balance") is not None else 100000.0
            except (TypeError, ValueError):
                pass
            member_data.append({
                "user_id": m["user_id"],
                "username": m.get("username", "Unknown"),
                "balance": balance,
                "initial_balance": initial_balance,
                "positions": positions,
            })

        # Fetch current prices for all tickers from cache (30s TTL)
        prices = {}
        for ticker in all_tickers:
            cached = cache_get(f"quote:{ticker}")
            if cached and cached.get("price"):
                prices[ticker] = float(cached["price"])
            else:
                # Try a quick yfinance fetch if not cached
                try:
                    stock = yf.Ticker(ticker)
                    info = stock.info or {}
                    price = (
                        info.get("currentPrice")
                        or info.get("regularMarketPrice")
                        or info.get("ask")
                    )
                    if price:
                        prices[ticker] = float(price)
                        cache_set(f"quote:{ticker}", {"ticker": ticker, "price": float(price)}, QUOTE_CACHE_DURATION)
                except Exception:
                    pass

        # Calculate equity and return for each member
        for md in member_data:
            position_value = 0.0
            for pos in md["positions"]:
                if not isinstance(pos, dict):
                    continue
                ticker = pos.get("ticker", "")
                qty = float(pos.get("quantity", 0))
                current_price = prices.get(ticker, float(pos.get("entryPrice", 0)))
                position_value += qty * current_price

            equity = md["balance"] + position_value
            initial = md["initial_balance"]
            return_pct = ((equity - initial) / initial * 100) if initial > 0 else 0.0

            entries.append({
                "user_id": md["user_id"],
                "username": md["username"],
                "equity": round(equity, 2),
                "return_pct": round(return_pct, 2),
                "direction": "up" if return_pct >= 0 else "down",
            })

        # Sort by return_pct descending
        entries.sort(key=lambda e: e["return_pct"], reverse=True)

        # Assign ranks
        for i, entry in enumerate(entries):
            entry["rank"] = i + 1
    except Exception as e:
        logger.error("leaderboard calc %s: %s", code, e)
        entries = []

    return jsonify({
        "leaderboard": entries,
        "requesting_user_id": requesting_user_id,
    })


@app.route("/api/gameroom/<code>/details", methods=["GET"])
@jwt_required()
def gameroom_details(code):
    """Room details — JWT required. Returns 404 if room doesn't exist, 403 if not a member."""
    if not DATABASE_URL:
        return jsonify({"error": "Database not configured"}), 503
    user_id = int(get_jwt_identity())
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("""
            SELECT gr.id, gr.code, gr.created_at, u.username AS creator_username
            FROM game_rooms gr
            LEFT JOIN users u ON u.id = gr.creator_id
            WHERE gr.code = %s
        """, (code.upper(),))
        room = cur.fetchone()
        if not room:
            cur.close()
            conn.close()
            return jsonify({"error": "Game room not found"}), 404

        # Check membership
        cur.execute(
            "SELECT 1 FROM game_room_members WHERE game_room_id = %s AND user_id = %s",
            (room["id"], user_id)
        )
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"error": "You are not a member of this room"}), 403

        # Get all members
        cur.execute("""
            SELECT u.username FROM game_room_members grm
            JOIN users u ON u.id = grm.user_id
            WHERE grm.game_room_id = %s
            ORDER BY grm.joined_at ASC
        """, (room["id"],))
        member_rows = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify({
            "code": room["code"],
            "creator": room["creator_username"],
            "member_count": len(member_rows),
            "created_at": room["created_at"].isoformat() if room["created_at"] else None,
            "members": [r["username"] for r in member_rows],
        })
    except Exception as e:
        logger.error("gameroom_details %s: %s", code, e)
        return jsonify({"error": str(e)}), 500


# ─── Startup ──────────────────────────────────────────────────────────────────
init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode, port=port, host=host)
