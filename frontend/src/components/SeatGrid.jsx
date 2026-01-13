export default function SeatGrid({ seats, selectedSeatIds, onToggle, disabled = false }) {
  const grouped = seats.reduce((acc, seat) => {
    const bucket = acc[seat.rowLabel] ?? [];
    bucket.push(seat);
    acc[seat.rowLabel] = bucket;
    return acc;
  }, {});

  const rows = Object.keys(grouped).sort();

  return (
    <div className={`seat-map ${disabled ? 'seat-map-disabled' : ''}`}>
      {rows.map((row) => (
        <div key={row} className="seat-row">
          <span className="row-label">{row}</span>
          <div className="seat-row-items">
            {grouped[row]
              .sort((a, b) => a.number - b.number)
              .map((seat) => {
                const isAvailable = seat.status === 'AVAILABLE';
                const isSelected = selectedSeatIds.includes(seat.id);
                const isClickable = !disabled && (isAvailable || isSelected);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={`seat ${isSelected ? 'selected' : ''}`}
                    disabled={!isClickable}
                    onClick={() => onToggle(seat)}
                    aria-label={`Fila ${seat.rowLabel} asiento ${seat.number}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
