export default function EngineeringModifier ({ module, modifier }) {
  return (
    <p
      key={`${module.name}_${module.slot}_engineering_modifier_${modifier.name}`}
      className={modifier.improvement ? 'text-success' : 'text-danger'}
      style={{ margin: 0, padding: 0 }}
    >
      <i
        className={`icon icarus-terminal-chevron-${modifier.improvement ? 'up' : 'down'}`}
        style={{ marginRight: '.25rem', fontSize: '1rem', position: 'relative', top: '.1rem' }}
      />
      {modifier.name}
      <span style={{ marginLeft: '.5rem' }}>
        <span className={modifier.improvement ? 'text-success' : 'text-danger'}>{modifier.difference}</span>
      </span>
    </p>
  )
}