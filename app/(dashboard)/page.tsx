"use client"

import { useEffect } from "react";
import EmptyOrg from "./_components/empty-org";
import BoardList from "./_components/board-list";

import { useOrganization } from "@clerk/nextjs";
import { useBoardLoading } from "@/providers/board-loading-provider";

interface DashboardPage{
  searchParams: {
    search?: string;
    favourites?: string;
  }
}

const DashboardPage = ({
  searchParams
}: DashboardPage) => {

  const { organization } = useOrganization()
  const { setLoadingBoard } = useBoardLoading()

  // Clear any loading states when returning to dashboard
  useEffect(() => {
    setLoadingBoard(null)
  }, [setLoadingBoard])

  return (
    <div className="flex-1 h-[calc(100%-160px)] sm:h-[calc(100%-140px)] lg:h-[calc(100%-80px)] p-3 sm:p-4 lg:p-6">
      {
        !organization ? (
          <EmptyOrg />
        ) : (
            <BoardList
              orgId={organization.id}
              query={searchParams}
            />
        )
      }
      
    </div>
  );
}

export default DashboardPage