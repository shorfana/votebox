// Voting.tsx
import React, { useState } from 'react';
import CreateVoting from '../components/CreateVoting';
import { HttpAgent } from '@dfinity/agent';
import { canisterId, createActor } from '../declarations/backend';
import type { Voting as VotingType } from '../declarations/backend/backend.did';
import EditVoting from '../components/EditVoting';
import { Pencil, Trash2 } from 'lucide-react';

export default function Voting() {
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('published');
  const [publishedVotes, setPublishedVotes] = useState<VotingType[]>([]);
  const [unpublishedVotes, setUnpublishedVotes] = useState<VotingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVoting, setEditingVoting] = useState<VotingType | null>(null);

  const fetchVotes = async () => {
    try {
      const agent = new HttpAgent({
        host: 'http://127.0.0.1:4943',
      });

      if (process.env.NODE_ENV !== 'production') {
        await agent.fetchRootKey();
      }

      const actor = createActor(canisterId, {
        agent,
      });

      const [published, unpublished] = await Promise.all([
        actor.getVotingPublish(),
        actor.getVotingNoPublish(),
      ]);

      setPublishedVotes(published);
      setUnpublishedVotes(unpublished);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching votes:', error);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVotes();
  }, [refreshTrigger]);

  const handleCancelVoting = async (idVoting: bigint) => {
    try {
      const agent = new HttpAgent({
        host: 'http://127.0.0.1:4943',
      });

      if (process.env.NODE_ENV !== 'production') {
        await agent.fetchRootKey();
      }

      const actor = createActor(canisterId, {
        agent,
      });

      const success = await actor.batalkanVoting(idVoting);

      if (success) {
        console.log('Voting dibatalkan dengan sukses');
        if (activeTab === 'published') {
          setPublishedVotes((prevVotes) =>
            prevVotes.filter((vote) => vote.idVoting !== idVoting),
          );
        } else {
          setUnpublishedVotes((prevVotes) =>
            prevVotes.filter((vote) => vote.idVoting !== idVoting),
          );
        }
      } else {
        console.error('Gagal membatalkan voting');
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat membatalkan voting:', error);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderTable = (votes: VotingType[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Judul
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipe Voting
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Voters
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {votes.map((vote) => (
            <tr key={vote.idVoting.toString()} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {vote.idVoting.toString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {vote.judul}
                </div>
                <div className="text-sm text-gray-500">
                  {vote.kandidat.join(', ')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {vote.userId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${
                    vote.tipe_voting === 'single'
                      ? 'bg-green-100 text-green-800'
                      : vote.tipe_voting === 'multi'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {vote.tipe_voting}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${vote.draft === 'publish' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {vote.draft}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {vote.voters.length}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => setEditingVoting(vote)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleCancelVoting(vote.idVoting)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mt-6 mb-10">
        <div className="">
          <h1 className="font-bold text-3xl tracking-tight mt-2">
            Halaman Voting
          </h1>
          <span className="font-extralight text-gray-600 text-base mt-2">
            Buat dan kelola voting anda disini.
          </span>
        </div>
        <button
          onClick={toggleForm}
          className="px-6 py-4 bg-blue-500 text-white font-extrabold rounded hover:bg-blue-600 text-sm"
        >
          Buat Voting
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <button
              onClick={toggleForm}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
            <CreateVoting onSuccess={handleFormSuccess} />
          </div>
        </div>
      )}

      {editingVoting && (
        <EditVoting
          votingId={editingVoting.idVoting}
          initialData={{
            judul: editingVoting.judul,
            kandidat: editingVoting.kandidat,
            closed_rules: editingVoting.closed_rules,
            tipe_voting: editingVoting.tipe_voting,
            tipe_akses: editingVoting.tipe_akses,
            mulai: editingVoting.mulai,
            selesai: editingVoting.selesai,
            draft: editingVoting.draft,
          }}
          onSuccess={() => {
            setEditingVoting(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
          onCancel={() => setEditingVoting(null)}
        />
      )}

      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('published')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'published'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'draft'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Draft
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          {activeTab === 'published' ? (
            publishedVotes.length > 0 ? (
              renderTable(publishedVotes)
            ) : (
              <p className="text-center text-gray-500">
                Belum ada voting yang dipublish
              </p>
            )
          ) : unpublishedVotes.length > 0 ? (
            renderTable(unpublishedVotes)
          ) : (
            <p className="text-center text-gray-500">Belum ada voting draft</p>
          )}
        </>
      )}
    </div>
  );
}
