import RootLayout from "@/components/layouts/primary/rootLayout";
import CommunityAddCard from "@/components/ui/community/communityAddCard";
import CommunityCard from "@/components/ui/community/communityCard";
import { trpc } from "@/utils/trpc";
import { Dialog, Transition } from "@headlessui/react";
import { AdjustmentsHorizontalIcon, ArrowUturnLeftIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useEffect } from "react";
import { Fragment, useState } from "react";

import type { NextPage } from "next";
const AddCommunityModal: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-700 bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-neutral-200 border-2 border-black px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <button
                  className="absolute top-2 left-2 text-black"
                  onClick={() => setOpen(false)}
                >
                  <ArrowUturnLeftIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-neutral-900"
                    >
                      Join or Create Community
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-600">
                        Would you like to join an existing community, or create
                        a new one?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <div className="inline-flex w-full justify-center gap-4">
                    <Link href="/trending">
                      <button
                        type="button"
                        className="btn-1 border-2 border-black drop-shadow-lg"
                      >
                        Join Community
                      </button>
                    </Link>
                    <Link href="/communities/create">
                      <button
                        type="button"
                        className="btn-1 border-2 border-black drop-shadow-lg"
                      >
                        Create Community
                      </button>
                    </Link>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const SearchBar: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  return (
    <div className="relative z-10 my-12 mx-12">
      <div className="flex gap-x-4 md:mx-24 2xl:mx-72">
        <div className="relative grow">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-neutral-500"
                aria-hidden="true"
              />
            </div>
            <input
              id="search"
              name="search"
              className="btn-input pl-10 pr-3"
              placeholder="Search"
              type="search"
            />
          </div>
        </div>
        <button onClick={handleOpenModal}>
          <div className="btn-1 px-4">
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            <div className="hidden md:flex">Add Community</div>
            <AddCommunityModal open={openModal} setOpen={setOpenModal} />
          </div>
        </button>
        <button className="btn-1">
          <AdjustmentsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const OwnedCommunities: React.FC = () => {
  const user = trpc.user.getUserBySession.useQuery();
  const userId = user.data?.id as string;
  const ownedCommunities = trpc.community.getOwnedCommunitiesByUserId.useQuery({
    userId: userId,
  });
  return ownedCommunities.data?.[0] ? (
    <div className="relative z-10 mx-12 my-12">
      <div className="heading-1">Owned Communities</div>
      <div className="grid grid-cols-1 justify-center gap-y-8 sm:grid-cols-2 sm:gap-x-8 lg:mx-24 lg:grid-cols-3 2xl:mx-72 ">
        {ownedCommunities.data?.map((community) => (
          <div key={community.name}>
            <Link href={community.id}>
              <CommunityCard
                image={community.image}
                name={community.name}
                slug={community.slug}
                description={community.description}
                totalMembers={community.totalMembers}
                activeMembers={community.activeMembers}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div />
  );
};

const MemberCommunities: React.FC = () => {
  const user = trpc.user.getUserBySession.useQuery();
  const userId = user.data?.id as string;
  const memberCommunities =
    trpc.community.getMemberCommunitiesByUserId.useQuery({
      userId: userId,
    });
  return (
    <div className="relative z-10 mx-12 my-12">
      <div className="heading-1">Communities</div>
      {memberCommunities.data?.[0] ? (
        <div className="grid grid-cols-1 justify-center gap-y-8 sm:grid-cols-2 sm:gap-x-8 lg:mx-24 lg:grid-cols-3 2xl:mx-72 ">
          {memberCommunities.data?.map((community) => (
            <div key={community.name}>
              <Link href={community.id}>
                <CommunityCard
                  image={community.image}
                  name={community.name}
                  slug={community.slug}
                  description={community.description}
                  totalMembers={community.totalMembers}
                  activeMembers={community.activeMembers}
                />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <CommunityAddCard />
      )}
    </div>
  );
};

const Communities: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/auth/signin");
    }
  });

  return (
    <RootLayout>
      <div className="overflow-hidden">
        <SearchBar />
        <OwnedCommunities />
        <MemberCommunities />
      </div>
    </RootLayout>
  );
};

export default Communities;
