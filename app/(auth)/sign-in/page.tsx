import AuthForm from "@/components/auth/AuthForm";
import { getSafeNextPath } from "@/lib/security/redirect";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) => {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next, "/");

  return <AuthForm type="sign-in" nextPath={nextPath} />;
};

export default page;
