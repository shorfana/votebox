import { useState, useEffect } from 'react';
import { createActor, canisterId } from '../declarations/backend';
import { HttpAgent } from '@dfinity/agent';

interface EditVotingProps {
  votingId: bigint;
  onSuccess: () => void;
  onCancel: () => void;
  initialData: {
    judul: string;
    kandidat: string[];
    closed_rules: string;
    tipe_voting: string;
    tipe_akses: string;
    mulai: string;
    selesai: string;
    draft: string;
  };
}

function EditVoting({
  votingId,
  onSuccess,
  onCancel,
  initialData,
}: EditVotingProps) {
  const [formData, setFormData] = useState(initialData);
  const [kandidat, setKandidat] = useState(initialData.kandidat);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKandidatChange = (index: number, value: string) => {
    const newKandidat = [...kandidat];
    newKandidat[index] = value;
    setKandidat(newKandidat);
  };

  const addKandidatField = () => {
    setKandidat([...kandidat, '']);
  };

  const removeKandidatField = (index: number) => {
    if (kandidat.length > 1) {
      const newKandidat = kandidat.filter((_, i) => i !== index);
      setKandidat(newKandidat);
    }
  };

  // Di backend.did terlihat bahwa parameter harus dalam format [] | [string]
  // yang artinya array kosong atau array dengan tepat satu string
  // Perlu mengubah cara kita mengirim data di EditVoting.tsx

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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

      // Perbaiki format data yang dikirim
      const updateData = {
        judul: formData.judul !== initialData.judul ? [formData.judul] : [], // Array kosong atau array dengan 1 string
        kandidat: kandidat !== initialData.kandidat ? [kandidat] : [], // Array kosong atau array dengan 1 array string
        closed_rules:
          formData.closed_rules !== initialData.closed_rules
            ? [formData.closed_rules]
            : [],
        tipe_voting:
          formData.tipe_voting !== initialData.tipe_voting
            ? [formData.tipe_voting]
            : [],
        tipe_akses:
          formData.tipe_akses !== initialData.tipe_akses
            ? [formData.tipe_akses]
            : [],
        mulai: formData.mulai !== initialData.mulai ? [formData.mulai] : [],
        selesai:
          formData.selesai !== initialData.selesai ? [formData.selesai] : [],
        draft: formData.draft !== initialData.draft ? [formData.draft] : [],
      };

      const success = await actor.editVoting(
        votingId,
        updateData.judul as [] | [string], // Tambahkan type assertion
        updateData.kandidat as [] | [string[]], // Tambahkan type assertion
        updateData.closed_rules as [] | [string],
        updateData.tipe_voting as [] | [string],
        updateData.tipe_akses as [] | [string],
        updateData.mulai as [] | [string],
        updateData.selesai as [] | [string],
        updateData.draft as [] | [string],
      );

      if (success) {
        alert('Voting berhasil diupdate!');
        onSuccess();
      } else {
        alert('Gagal mengupdate voting');
      }
    } catch (error) {
      console.error('Error updating voting:', error);
      alert('Gagal mengupdate voting: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Edit Voting</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Judul Voting</label>
            <input
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Kandidat</label>
            {kandidat.map((k, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={k}
                  onChange={(e) => handleKandidatChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded"
                  required
                />
                {kandidat.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKandidatField(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addKandidatField}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Tambah Kandidat
            </button>
          </div>

          <div>
            <label className="block mb-1">Closed Rules</label>
            <select
              name="closed_rules"
              value={formData.closed_rules}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Pilih Closed Rules</option>
              <option value="waktu">Berdasarkan Waktu</option>
              <option value="minimal partisipasi">Minimal Partisipasi</option>
              <option value="close otomatis setelah menang">
                Close Otomatis Setelah Menang
              </option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Tipe Voting</label>
            <select
              name="tipe_voting"
              value={formData.tipe_voting}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Pilih Tipe Voting</option>
              <option value="single">Single Vote</option>
              <option value="multi">Multi Vote</option>
              <option value="gabungan">Gabungan</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Tipe Akses</label>
            <select
              name="tipe_akses"
              value={formData.tipe_akses}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Pilih Tipe Akses</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {formData.closed_rules === 'waktu' && (
            <>
              <div>
                <label className="block mb-1">Waktu Mulai</label>
                <input
                  type="datetime-local"
                  name="mulai"
                  value={formData.mulai}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Waktu Selesai</label>
                <input
                  type="datetime-local"
                  name="selesai"
                  value={formData.selesai}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block mb-1">Status</label>
            <select
              name="draft"
              value={formData.draft}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="no_publish">Draft</option>
              <option value="publish">Publish</option>
            </select>
          </div>

          {/* Tambahkan field lainnya seperti di form tambah voting */}

          <div className="flex gap-4 justify-end mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVoting;
