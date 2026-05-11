import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const COMPANY_REQUIRED_MESSAGE =
  "Vul eerst je bedrijfsprofiel aan om contact te leggen met andere bedrijven.";

export function useMyCompanyId() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-company-id", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.company_id ?? null;
    },
  });
}

/**
 * Hook returning a `requireCompany()` guard. If the user has no linked
 * company profile, shows a toast with a CTA to the setup flow and
 * returns false. Otherwise returns the company id.
 */
export function useCompanyGate() {
  const navigate = useNavigate();
  const router = useRouter();
  const { data: companyId, isLoading } = useMyCompanyId();

  const requireCompany = useCallback((): string | false => {
    if (companyId) return companyId;
    const currentPath = router.state.location.href;
    toast.error(COMPANY_REQUIRED_MESSAGE, {
      action: {
        label: "Bedrijfsprofiel aanmaken",
        onClick: () =>
          navigate({
            to: "/bedrijf-aanmaken",
            search: { redirect: currentPath } as never,
          }),
      },
      duration: 8000,
    });
    return false;
  }, [companyId, navigate, router]);

  return { companyId: companyId ?? null, isLoading, requireCompany };
}
