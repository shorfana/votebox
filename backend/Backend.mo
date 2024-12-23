import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
// import HashMap "mo:base/HashMap";

// Define the Voting type
actor {

  stable var lastId: Nat = 0;
  public func generateId(): async Nat {
    lastId += 1; // Increment ID
    return lastId; // Kembalikan ID baru
  };
  type Voting = {
    idVoting: Nat; //id votingnya untuk kmenentukan voting mananya
    userId: Text; //user id untuk menentukan kalo voting ini dibikin sama siapa
    judul: Text; // judul untuk menulis judul votingnya
    kandidat: [Text]; // untuk memilih kandidat, sifatnya multiple dan addable 
    closed_rules: Text; // aturan penutupannya ada 3 (berdasarkan waktu, Berdasarkan Minimal Partisipasi, Close Otomatis Setelah Menang)
    mulai: Text; // berdasarkan aturan waktu mulai (masuk colsed rules 1)
    selesai: Text; // berdasarkkan watu selesai (masuk colsed rules 1)
    min_participans: Nat; // berdasarkan minimal partisipasi (masukk rules 2)
    closed_auto_participans: Nat; // berdasarkan closed otomatis jika ada pilihan yang sudah mendapat suara terbanyak sesuai kriteria (masukk rules 3)
    tipe_voting: Text; // tipe voting disini untuk menentukan tipenya ada 3 (single voting, multi voting dan gabungan) berarti nanti valuenya "singlevoting", "multivoting","gabungan"
    tipe_akses: Text; // tipe akses disini mau publik atau private si votingnya
    draft: Text;  // field berfungsi untuk apakah votingnya mau langsung publish atau mau di hold dulu 
    voters: [Vote]; // Array of votes for tracking who voted and for which candidate
  };

  // Define the Vote type to store user votes
  type Vote = {
    user_id: Text; // User identifier (could be email, username, etc.)
    kandidat: Text; // The candidate chosen by the user
  };

  // Stable variable to store the list of votes
  stable var votes: [Voting] = [];


  // Function to add a voting entry
  public func tambahVoting(
    userId: Text,
    judul: Text,
    kandidat: [Text],
    closed_rules: Text,  // 'waktu', 'minimal partisipasi', or 'close otomatis setelah menang'
    tipe_voting: Text,   // 'single', 'multi', or 'gabungan'
    tipe_akses: Text,
    mulai: ?Text,        // Optional for 'waktu' rule
    selesai: ?Text,      // Optional for 'waktu' rule
    min_participans: ?Nat, // Optional for 'minimal partisipasi'
    closed_auto_participans: ?Nat, // Optional for 'close otomatis setelah menang'
    draft: Text
): async Nat {

    // Validasi aturan penutupan voting
    switch (closed_rules) {
        case ("waktu") {
            // Pastikan mulai dan selesai ada untuk aturan 'waktu'
            if (mulai == null or selesai == null) {
                Debug.trap("Field 'mulai' dan 'selesai' harus diisi untuk aturan penutupan 'waktu'.");
            };
        };
        case ("minimal partisipasi") {
            // Pastikan min_participans ada untuk aturan 'minimal partisipasi'
            if (min_participans == null) {
                Debug.trap("Field 'min_participans' harus diisi untuk aturan penutupan 'minimal partisipasi'.");
            };
        };
        case ("close otomatis setelah menang") {
            // Pastikan closed_auto_participans ada untuk aturan 'close otomatis setelah menang'
            if (closed_auto_participans == null) {
                Debug.trap("Field 'closed_auto_participans' harus diisi untuk aturan penutupan 'close otomatis setelah menang'.");
            };
        };
        case (_) {
            Debug.trap("Aturan penutupan tidak valid. Harus berupa 'waktu', 'minimal partisipasi', atau 'close otomatis setelah menang'.");
        };
    };

    // Validasi tipe_voting
    let tipe_voting_id: Nat = switch (tipe_voting) {
        case ("single") 1;
        case ("multi") 2;
        case ("gabungan") 3;
        case (_) Debug.trap("Tipe voting tidak valid. Harus berupa 'single', 'multi', atau 'gabungan'.");
    };

    // Generate idVoting
    let idVoting = await generateId();

    // Buat objek voting baru
    let newVoting: Voting = {
        idVoting = idVoting;
        userId = userId;
        judul = judul;
        kandidat = kandidat;
        closed_rules = closed_rules;
        tipe_voting = switch (tipe_voting_id) {
            case (1) "single";
            case (2) "multi";
            case (3) "gabungan";
        };
        tipe_akses = tipe_akses;
        mulai = switch (mulai) { case (?m) m; case null "" }; // Default ke string kosong jika tidak ada
        selesai = switch (selesai) { case (?s) s; case null "" }; // Default ke string kosong jika tidak ada
        min_participans = switch (min_participans) { case (?mp) mp; case null 0 }; // Default ke 0 jika tidak ada
        closed_auto_participans = switch (closed_auto_participans) { case (?cap) cap; case null 0 }; // Default ke 0 jika tidak ada
        draft = draft;
        voters = []; // Initialize dengan list kosong
    };

    // Tambahkan voting baru ke daftar
    votes := Array.append<Voting>(votes, [newVoting]);

    return idVoting;
};



  // Function to edit a voting entry
  public func editVoting(
    idVoting: Nat,
    judul: ?Text,
    kandidat: ?[Text],
    closed_rules: ?Text,
    tipe_voting: ?Text,
    tipe_akses: ?Text,
    mulai: ?Text,
    selesai: ?Text,
    draft: ?Text
  ): async Bool {
    // Cari voting berdasarkan idVoting
    let maybeVoting = Array.find<Voting>(votes, func(vote) {
      vote.idVoting == idVoting;
    });

    switch maybeVoting {
      case (null) {
        // Jika voting tidak ditemukan, kembalikan false
        return false;
      };
      case (?voting) {
        // Buat salinan baru dari Voting dengan properti yang diperbarui jika ada
        let updatedVoting: Voting = {
          idVoting = voting.idVoting;
          userId = voting.userId;
          judul = switch judul {
            case (null) voting.judul; // Gunakan nilai lama jika tidak ada nilai baru
            case (?newJudul) newJudul; // Gunakan nilai baru jika tersedia
          };
          kandidat = switch kandidat {
            case (null) voting.kandidat; // Gunakan nilai lama jika tidak ada nilai baru
            case (?newKandidat) newKandidat; // Gunakan nilai baru jika tersedia
          };
          closed_rules = switch closed_rules {
            case (null) voting.closed_rules;
            case (?newclosed_rules) newclosed_rules;
          };
          tipe_voting = switch tipe_voting {
            case (null) voting.tipe_voting;
            case (?newTipeVoting) newTipeVoting;
          };
          tipe_akses = switch tipe_akses {
            case (null) voting.tipe_akses;
            case (?newTipeAkses) newTipeAkses;
          };
          mulai = switch mulai {
            case (null) voting.mulai;
            case (?newMulai) newMulai;
          };
          selesai = switch selesai {
            case (null) voting.selesai;
            case (?newSelesai) newSelesai;
          };
          draft = switch draft {
            case (null) voting.draft;
            case (?newDraft) newDraft;
          };
          voters = voting.voters; // Voters tetap sama
          closed_auto_participans = voting.closed_auto_participans; // Menambahkan field yang hilang
          min_participans = voting.min_participans; // Menambahkan field yang hilang
        };

        // Perbarui daftar votes dengan Voting yang diperbarui
        votes := Array.map<Voting, Voting>(votes, func(existingVoting) {
          if (existingVoting.idVoting == idVoting) {
            updatedVoting // Perbarui voting yang sesuai
          } else {
            existingVoting // Tetap gunakan voting lama
          };
        });

        return true;
      };
    };
  };

  


  public func tambahVote(idVoting: Nat, userId: Text, kandidat: Text): async Bool {
    // Cari pemungutan suara berdasarkan idVoting
    let maybeVoting = Array.find<Voting>(votes, func(vote) {
        vote.idVoting == idVoting;
    });

    switch maybeVoting {
        case (null) {
            // Jika voting tidak ditemukan, kembalikan false
            return false;
        };
        case (?voting) {
            // Periksa apakah kandidat valid
            let isValidCandidate = Array.find<Text>(voting.kandidat, func(candidate) {
                candidate == kandidat;
            });

            if (isValidCandidate == null) {
                // Jika kandidat tidak valid, kembalikan false
                return false;
            };

            // Validasi tipe voting
            switch (voting.tipe_voting) {
                case ("single") {
                    // Periksa apakah pengguna sudah memberikan suara
                    let alreadyVoted = Array.find<Vote>(voting.voters, func(vote) {
                        vote.user_id == userId;
                    });

                    if (alreadyVoted != null) {
                        // Jika pengguna sudah memberikan suara dalam tipe single, tidak boleh memberikan lagi
                        return false;
                    };
                };
                case ("multi") {
                    // Untuk tipe multi, tidak ada batasan suara
                };
                case ("gabungan") {
                    // Periksa apakah pengguna sudah memberikan suara pada kandidat yang sama
                    let alreadyVotedForCandidate = Array.find<Vote>(voting.voters, func(vote) {
                        vote.user_id == userId and vote.kandidat == kandidat;
                    });

                    if (alreadyVotedForCandidate != null) {
                        // Jika pengguna sudah memberikan suara untuk kandidat yang sama, tidak boleh memberikan lagi
                        return false;
                    };
                };
                case (_) {
                    // Jika tipe voting tidak valid, kembalikan false
                    return false;
                };
            };

            // Tambahkan suara pengguna ke daftar voters
            let newVote: Vote = {
                user_id = userId;
                kandidat = kandidat;
            };

            // Buat salinan baru dari objek Voting dengan voters yang diperbarui
            let updatedVoting: Voting = {
                idVoting = voting.idVoting;
                userId = voting.userId;
                judul = voting.judul;
                kandidat = voting.kandidat;
                closed_rules = voting.closed_rules;
                closed_auto_participans = voting.closed_auto_participans; // Include this field
                min_participans = voting.min_participans; // Include this field
                tipe_voting = voting.tipe_voting;
                tipe_akses = voting.tipe_akses;
                mulai = voting.mulai;
                selesai = voting.selesai;
                draft = voting.draft;
                voters = Array.append<Vote>(voting.voters, [newVote]); // Add the new vote
            };

            // Perbarui daftar votes dengan Voting yang diperbarui
            votes := Array.map<Voting, Voting>(votes, func(existingVoting) {
                if (existingVoting.idVoting == idVoting) {
                    updatedVoting; // Perbarui voting yang sesuai
                } else {
                    existingVoting; // Tetap gunakan voting lama
                };
            });

            return true;
        };
    };
};



public func batalkanVoting(idVoting: Nat): async Bool {
    let index = Array.find<Voting>(votes, func(vote) {
        vote.idVoting == idVoting;
    });

    switch index {
        case (null) {
            // Jika voting tidak ditemukan, kembalikan false
            return false;
        };
        case (?voting) {
            // Hapus voting dari daftar
            votes := Array.filter<Voting>(votes, func(vote) {
                 vote.idVoting != idVoting;
            });

            return true;
        };
    };

};
  


    public query func getHasilVoting(idVoting: Nat): async ?[(Text, Nat)] {
    // Cari voting berdasarkan idVoting
    let maybeVoting = Array.find<Voting>(votes, func(vote) {
      vote.idVoting == idVoting;
    });

    switch maybeVoting {
      case (null) {
        // Jika voting tidak ditemukan, kembalikan null
        return null;
      };
      case (?voting) {
        // Hitung jumlah suara untuk setiap kandidat
        let hasilVoting = Array.map<Text, (Text, Nat)>(voting.kandidat, func(kandidat) {
          let jumlahSuara = Array.foldLeft<Vote, Nat>(
            voting.voters,
            0,
            func(acc, voter) {
              if (voter.kandidat == kandidat) {
                acc + 1 // Tambahkan suara jika kandidat cocok
              } else {
                acc // Tetap
              };
            },
          );
          (kandidat, jumlahSuara); // Pasangkan kandidat dengan jumlah suaranya
        });

        return ?hasilVoting;
      };
    };
  };
  
  
  
  // Function to retrieve all published votes
  public query func getVotingPublish(): async [Voting] {
    return Array.filter<Voting>(votes, func(vote) {
      vote.draft == "publish";
    });
  };

  // Function to retrieve all unpublished votes
  public query func getVotingNoPublish(): async [Voting] {
    return Array.filter<Voting>(votes, func(vote) {
      vote.draft == "no_publish";
    });
  };
};

