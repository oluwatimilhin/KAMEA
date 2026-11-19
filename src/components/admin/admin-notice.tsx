export default function AdminNotice({ message }: { message: string }) {
  return (
    <p aria-live="polite" className="admin-notice" role="status">
      {message}
    </p>
  );
}
