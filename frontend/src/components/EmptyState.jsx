export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state__icon" aria-hidden="true">
          <Icon size={30} strokeWidth={1.6} />
        </div>
      )}
      <h2 className="empty-state__title">{title}</h2>
      {children && <p className="empty-state__text">{children}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
