import { useState, useEffect } from 'react';
import { canisterId, createActor } from '../declarations/backend';
import type { Voting as BackendVoting } from '../declarations/backend/backend.did';
import { HttpAgent } from '@dfinity/agent';
import EditVoting from './EditVoting';

interface ListVotingProps {
  refreshTrigger: number;
}

function ListVoting({ refreshTrigger }: ListVotingProps) {
  const [publishedVotes, setPublishedVotes] = useState<BackendVoting[]>([]);
  const [editingVoting, setEditingVoting] = useState<BackendVoting | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const initActor = async () => {
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

      const votes = await actor.getVotingPublish();
      console.log('Fetched votes:', votes);
      setPublishedVotes(votes);
    } catch (error) {
      console.error('Error initializing actor:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initActor();
  }, [refreshTrigger]);

  const handleCancelVoting = async (idVoting: bigint) => {
    try {
      const agent = new HttpAgent({
        host: 'http://127.0.0.1:4943', // Sesuaikan dengan alamat host yang Anda gunakan
      });

      if (process.env.NODE_ENV !== 'production') {
        await agent.fetchRootKey(); // Mendapatkan root key untuk pengembangan
      }

      const actor = createActor(canisterId, {
        agent,
      });

      const success = await actor.batalkanVoting(idVoting); // Memanggil fungsi batalkanVoting dengan idVoting

      if (success) {
        // Jika berhasil dibatalkan, perbarui daftar voting yang dipublikasikan
        console.log('Voting dibatalkan dengan sukses');
        setPublishedVotes((prevVotes) =>
          prevVotes.filter((vote) => vote.idVoting !== idVoting),
        ); // Menghapus voting yang dibatalkan
      } else {
        console.error('Gagal membatalkan voting');
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat membatalkan voting:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Daftar Voting yang Dipublish
        </h1>
        {publishedVotes.length === 0 ? (
          <p className="text-center text-gray-500">
            Belum ada voting yang dipublish
          </p>
        ) : (
          <div className="grid gap-4">
            {publishedVotes.map((vote) => (
              <div
                key={vote.idVoting.toString()}
                className="bg-white p-6 rounded-lg shadow"
              >
                <h1>ID VOTING : {vote.idVoting.toString()}</h1>
                <h2 className="text-xl font-semibold mb-4">{vote.judul}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Kandidat:</h3>
                    <ul className="list-disc list-inside">
                      {vote.kandidat.map((kandidat, idx) => (
                        <li key={idx}>{kandidat}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">User ID:</span>{' '}
                      {vote.userId}
                    </p>
                    <p>
                      <span className="font-medium">Tipe Voting:</span>{' '}
                      {vote.tipe_voting}
                    </p>
                    <p>
                      <span className="font-medium">Tipe Akses:</span>{' '}
                      {vote.tipe_akses}
                    </p>
                    {vote.mulai && (
                      <p>
                        <span className="font-medium">Mulai:</span>{' '}
                        {new Date(vote.mulai).toLocaleString()}
                      </p>
                    )}
                    {vote.selesai && (
                      <p>
                        <span className="font-medium">Selesai:</span>{' '}
                        {new Date(vote.selesai).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Closed Rules:
                  </h3>
                  <p className="text-gray-600">{vote.closed_rules}</p>
                  {vote.min_participans > 0n && (
                    <p className="text-gray-600">
                      Minimal Partisipasi: {vote.min_participans.toString()}
                    </p>
                  )}
                  {vote.closed_auto_participans > 0n && (
                    <p className="text-gray-600">
                      Target Menang: {vote.closed_auto_participans.toString()}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Total Voters: {vote.voters.length}
                  </h3>
                </div>
                <button onClick={() => handleCancelVoting(vote.idVoting)}>
                  Batalkan Voting
                </button>
                <button
                  onClick={() => setEditingVoting(vote)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
              </div>
            ))}
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
                  // Refresh daftar voting
                  initActor();
                }}
                onCancel={() => setEditingVoting(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListVoting;
