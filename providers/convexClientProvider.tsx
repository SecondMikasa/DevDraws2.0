"use client";

import { useAuth } from "@clerk/nextjs";
import { AuthLoading, Authenticated, Unauthenticated, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import Loading from "@/components/auth/loading";
import { useRouter } from "next/navigation";

interface ConvexClientProviderProps {
  children: React.ReactNode;
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({
  children,
}: ConvexClientProviderProps) {
  const router = useRouter();

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <Authenticated>
        {children}
      </Authenticated>
      <Unauthenticated>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to DevDraws</h2>
            <p className="text-gray-600 mb-6">Please sign in to continue</p>
            <button
              onClick={() => router.push("/sign-in")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <Loading />
      </AuthLoading>
    </ConvexProviderWithClerk>
  );
}
