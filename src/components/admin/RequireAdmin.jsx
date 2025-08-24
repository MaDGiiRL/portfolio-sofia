import AdminGate from "./AdminGate";
export default function RequireAdmin({ children }) {
  return <AdminGate>{children}</AdminGate>;
}