import { useState, useEffect } from 'react';
import { canisterId, createActor } from '../declarations/backend';
import type { Voting as BackendVoting } from '../declarations/backend/backend.did';
import { HttpAgent } from '@dfinity/agent';
import toast from 'react-hot-toast';

export default function Overview() {
  const [votings, setVotings] = useState<BackendVoting[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [isVoting, setIsVoting] = useState();
  const [selectedVoting, setSelectedVoting] = useState<BackendVoting | null>(
    null,
  );
  const [selectedKandidat, setSelectedKandidat] = useState<string>('');
  const [message, setMessage] = useState('');

  const fetchVotings = async () => {
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

      const publishedVotings = await actor.getVotingPublish();
      setVotings(publishedVotings);
    } catch (error) {
      console.error('Error fetching votings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit vote
  const submitVote = async () => {
    if (!selectedVoting || !selectedKandidat || !userId) {
      setMessage('Mohon lengkapi semua data');
      return;
    }

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

      const result = await actor.tambahVote(
        selectedVoting.idVoting,
        userId,
        selectedKandidat,
      );

      if (result) {
        toast.success('Berhasil Memilih Kandidat!');
        setMessage('Vote berhasil ditambahkan!');
        // Reset form
        setSelectedVoting(null);
        setSelectedKandidat('');
        // Refresh voting list
        fetchVotings();
      } else {
        setMessage(
          'Gagal menambahkan vote. Mungkin Anda sudah memilih atau ada masalah lain.',
        );
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setMessage('Error: ' + error);
    }
  };

  useEffect(() => {
    fetchVotings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Cast Your Vote</span>
            <span className="block text-blue-600">Make Your Voice Heard</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Participate in secure and transparent voting. Your vote matters!
          </p>
        </div>
        {/* User ID Input Section */}
        {/* <div className="max-w-md mx-auto mb-12 bg-white rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voter ID
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md h-12"
              placeholder="Enter your voter ID"
            />
          </div>
        </div> */}
        {/* Available Votings Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Available Votings
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {votings.map((voting) => (
              <div
                key={voting.idVoting.toString()}
                onClick={() => setSelectedVoting(voting)}
                className={`
                  relative rounded-2xl overflow-hidden transition-all duration-300 ease-in-out
                  ${
                    selectedVoting?.idVoting === voting.idVoting
                      ? 'ring-4 ring-blue-500 transform scale-105'
                      : 'hover:shadow-xl cursor-pointer transform hover:-translate-y-1'
                  }
                `}
              >
                <div className="bg-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {voting.judul}
                      </h3>
                      <div className="space-y-2">
                        <span
                          className={`
                          inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${
                            voting.tipe_voting === 'single'
                              ? 'bg-purple-100 text-purple-800'
                              : voting.tipe_voting === 'multi'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                          }
                        `}
                        >
                          {voting.tipe_voting}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-sm font-medium text-gray-800">
                        {voting.voters.length} votes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Voting Form Modal */}
        {selectedVoting && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedVoting.judul}
                  </h2>
                  <button
                    onClick={() => setSelectedVoting(null)}
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {message && (
                    <div
                      className={`p-4 rounded-lg ${
                        message.includes('berhasil')
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  {/* Voter ID Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Voter ID
                    </label>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your voter ID"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="font-medium text-gray-900 mb-2">
                      Select Candidate:
                    </div>
                    {selectedVoting.kandidat.map((kandidat) => (
                      <label
                        key={kandidat}
                        className={`
                  relative block rounded-lg border-2 p-4 cursor-pointer transition-all
                  ${
                    selectedKandidat === kandidat
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }
                `}
                      >
                        <input
                          type="radio"
                          name="kandidat"
                          value={kandidat}
                          checked={selectedKandidat === kandidat}
                          onChange={(e) => setSelectedKandidat(e.target.value)}
                          className="absolute opacity-0"
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {kandidat}
                          </span>
                          {selectedKandidat === kandidat && (
                            <svg
                              className="h-6 w-6 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={submitVote}
                    disabled={!selectedKandidat || !userId || isVoting}
                    className={`
              w-full py-3 px-4 rounded-lg text-white font-medium transition-all
              ${
                !selectedKandidat || !userId || isVoting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              }
            `}
                  >
                    {isVoting ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing Vote...
                      </div>
                    ) : (
                      'Cast Your Vote'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
