interface Props {
  [key: string]: unknown;
}

export function GenreAxisTick(props: Props) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const payload = props.payload as { value: string } | undefined;
  const label = payload?.value ?? '';

  const parts = label.split(' / ');
  if (parts.length <= 1) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} textAnchor="end" fontSize={12} dominantBaseline="central">
          {label}
        </text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} textAnchor="end" fontSize={12} dominantBaseline="central">
        <tspan x={0} dy="-0.6em">{parts[0]} /</tspan>
        <tspan x={0} dy="1.4em">{parts.slice(1).join(' / ')}</tspan>
      </text>
    </g>
  );
}
