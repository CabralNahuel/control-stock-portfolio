import { CrearPasswordForm } from "./ui/CrearPasswordForm";

type Props = {
  searchParams: { token?: string };
};

export default function CrearPasswordPage({ searchParams }: Props) {
  const token = searchParams.token ?? null;
  return <CrearPasswordForm token={token} />;
}

