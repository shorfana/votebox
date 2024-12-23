import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LayoutDashboard from './components/LayoutDashboard';
import Voting from './pages/Voting';
import Overview from './pages/Overview';
import { Toaster } from 'react-hot-toast';

function App() {
  // const [refreshTrigger, setRefreshTrigger] = useState(0);

  // // State untuk form
  // const [formData, setFormData] = useState({
  //   userId: '',
  //   judul: '',
  //   closed_rules: '',
  //   tipe_voting: '',
  //   tipe_akses: '',
  //   mulai: '',
  //   selesai: '',
  //   min_participans: 0,
  //   closed_auto_participans: 0,
  //   draft: 'no_publish',
  // });

  // // State untuk array kandidat
  // const [kandidat, setKandidat] = useState(['']);

  // const { call: tambahVoting, loading } = useUpdateCall({
  //   functionName: 'tambahVoting',
  //   onSuccess: () => {
  //     alert('Voting berhasil ditambahkan!');
  //     setFormData({
  //       userId: '',
  //       judul: '',
  //       closed_rules: '',
  //       tipe_voting: '',
  //       tipe_akses: '',
  //       mulai: '',
  //       selesai: '',
  //       min_participans: 0,
  //       closed_auto_participans: 0,
  //       draft: 'no_publish',
  //     });
  //     setKandidat(['']);
  //     setRefreshTrigger((prev) => prev + 1);
  //   },
  // });

  // // Handler untuk input form
  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // // Handler untuk input kandidat
  // const handleKandidatChange = (index: number, value: string) => {
  //   const newKandidat = [...kandidat];
  //   newKandidat[index] = value;
  //   setKandidat(newKandidat);
  // };

  // // Tambah field kandidat
  // const addKandidatField = () => {
  //   setKandidat([...kandidat, '']);
  // };

  // // Hapus field kandidat
  // const removeKandidatField = (index: number) => {
  //   if (kandidat.length > 1) {
  //     const newKandidat = kandidat.filter((_, i) => i !== index);
  //     setKandidat(newKandidat);
  //   }
  // };

  // // Handler submit form
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     await tambahVoting([
  //       // Hapus {args: }
  //       formData.userId,
  //       formData.judul,
  //       kandidat,
  //       formData.closed_rules,
  //       formData.tipe_voting,
  //       formData.tipe_akses,
  //       formData.mulai ? [formData.mulai] : [],
  //       formData.selesai ? [formData.selesai] : [],
  //       formData.min_participans ? [BigInt(formData.min_participans)] : [],
  //       formData.closed_auto_participans
  //         ? [BigInt(formData.closed_auto_participans)]
  //         : [],
  //       formData.draft,
  //     ]);
  //   } catch (error) {
  //     console.error('Error adding voting:', error);
  //     alert('Gagal menambahkan voting: ' + error);
  //   }
  // };

  // ... Form JSX sama seperti sebelumnya ...

  return (
    <>
      {/* <div className="p-8 bg-gray-100">
        <div className="max-w-2xl bg-white p-6 rounded-lg shadow">
          <h1 className="text-xl font-bold mb-6">Tambah Voting Baru</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="">User ID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>

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
                    onChange={(e) =>
                      handleKandidatChange(index, e.target.value)
                    }
                    className="flex-1 p-2 border rounded"
                    placeholder={`Kandidat ${index + 1}`}
                    required
                  />
                  {kandidat.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKandidatField(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addKandidatField}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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

            {formData.closed_rules === 'minimal partisipasi' && (
              <div>
                <label className="block mb-1">Minimal Partisipasi</label>
                <input
                  type="number"
                  name="min_participans"
                  value={formData.min_participans}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                  required
                />
              </div>
            )}

            {formData.closed_rules === 'close otomatis setelah menang' && (
              <div>
                <label className="block mb-1">Target Suara Untuk Menang</label>
                <input
                  type="number"
                  name="closed_auto_participans"
                  value={formData.closed_auto_participans}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                  required
                />
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Menyimpan...' : 'Simpan Voting'}
            </button>
          </form>
        </div>
      </div>
      <ListVoting refreshTrigger={refreshTrigger} /> */}
      <BrowserRouter>
        <div className="">
          <Routes>
            <Route element={<LayoutDashboard />}>
              <Route path="/voting" element={<Voting />} />
              <Route path="/dashboard" element={<Overview />} />
            </Route>
          </Routes>
        </div>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: '8px' }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 3000,
            },
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </BrowserRouter>
    </>
  );
}

export default App;
