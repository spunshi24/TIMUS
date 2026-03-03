import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Position } from "@/pages/Simulator";

interface PositionsPanelProps {
  positions: Position[];
  onClosePosition: (positionId: string) => void;
}

const PositionsPanel = ({ positions, onClosePosition }: PositionsPanelProps) => {
  const totalPnL = positions.reduce((sum, pos) => {
    const pnl = (pos.currentPrice - pos.entryPrice) * pos.quantity;
    return sum + pnl;
  }, 0);

  return (
    <div className="p-6 rounded-lg border-2 border-border bg-card shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Open Positions</h3>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total P&L</p>
          <p
            className={`text-xl font-bold ${
              totalPnL >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {totalPnL >= 0 ? "+" : ""}
            ${totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No open positions</p>
          <p className="text-sm text-muted-foreground mt-2">
            Place a buy order to start trading
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((position) => {
            const pnl = (position.currentPrice - position.entryPrice) * position.quantity;
            const pnlPercent =
              ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;

            return (
              <div
                key={position.id}
                className="p-4 rounded-lg border-2 border-border bg-muted/30 hover:bg-muted/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl font-bold text-foreground">
                      {position.ticker}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {position.quantity} shares @ ${position.entryPrice.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onClosePosition(position.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                    <p className="text-sm font-bold text-foreground">
                      ${position.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">P&L</p>
                    <p
                      className={`text-sm font-bold ${
                        pnl >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Return</p>
                    <p
                      className={`text-sm font-bold ${
                        pnlPercent >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {pnlPercent >= 0 ? "+" : ""}
                      {pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onClosePosition(position.id)}
                    className="w-full"
                  >
                    Close Position
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PositionsPanel;
