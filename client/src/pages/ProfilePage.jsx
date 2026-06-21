import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Spinner, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PencilSquare, StarFill, BookmarkFill } from "react-bootstrap-icons";
import api from "../api/api";
import { useAuth } from "../App";
import toast from "react-hot-toast";
import "../styles/ProfilePage.css";

const getInitials = (name = "", email = "") => {
    const source = name || email || "";
    if (!source) return "?";
    const parts = source.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const { watchlist } = useSelector((state) => state.user);

    const [profile, setProfile] = useState(null);
    const [editName, setEditName] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [ratingCount, setRatingCount] = useState(0);

    // State untuk batasan waktu (menit tersisa)
    const [minutesUntilUpdate, setMinutesUntilUpdate] = useState(0);

    useEffect(() => {
        if (!user) {
            navigate("/signin");
            return;
        }

        const fetchAll = async () => {
            setLoading(true);
            try {
                const [profileRes, reviewsRes] = await Promise.all([
                    api.get("/users/profile"),
                    api.get("/reviews/my-reviews"),
                ]);

                const mergedProfile = {
                    ...user,
                    ...profileRes.data,
                };

                setProfile(mergedProfile);
                setEditName(mergedProfile.displayName || mergedProfile.username || "");

                // --- LOGIKA BATASAN 1 JAM (60 Menit) ---
                if (mergedProfile.lastDisplayNameUpdate) {
                    const lastUpdate = new Date(mergedProfile.lastDisplayNameUpdate);
                    const now = new Date();

                    // Hitung selisih dalam milidetik
                    const diffMs = now - lastUpdate;
                    // Konversi ke menit
                    const diffMinutes = Math.floor(diffMs / (1000 * 60));

                    // Jika kurang dari 60 menit, hitung sisa waktu
                    if (diffMinutes < 60) {
                        setMinutesUntilUpdate(60 - diffMinutes);
                    } else {
                        setMinutesUntilUpdate(0);
                    }
                }
                // ---------------------------------------

                const reviewsData = reviewsRes.data;
                let count = 0;
                if (Array.isArray(reviewsData)) count = reviewsData.length;
                setRatingCount(count);

            } catch (err) {
                console.error("Gagal memuat data profil:", err);
                toast.error("Gagal memuat data profil");
                if (user) {
                    setProfile(user);
                    setEditName(user.displayName || user.username || "");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [user, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!editName.trim()) {
            toast.error("Nama tampilan tidak boleh kosong");
            return;
        }

        if (minutesUntilUpdate > 0) {
            toast.error(`Anda baru bisa mengganti nama lagi dalam ${minutesUntilUpdate} menit.`);
            return;
        }

        setSaving(true);
        try {
            const userId = profile?._id || profile?.id;

            if (!userId) {
                throw new Error("ID User tidak ditemukan di frontend.");
            }

            const payload = {
                displayName: editName.trim(),
                lastDisplayNameUpdate: new Date().toISOString() // Simpan waktu sekarang
            };

            const res = await api.patch(`/users/update/${userId}`, payload);
            const updated = res.data?.user || res.data || {};

            setProfile((prev) => ({
                ...prev,
                ...updated,
                displayName: payload.displayName,
                lastDisplayNameUpdate: payload.lastDisplayNameUpdate
            }));

            // Update juga di context global
            setUser((prev) => ({
                ...prev,
                displayName: payload.displayName,
                lastDisplayNameUpdate: payload.lastDisplayNameUpdate,
            }));


            // Set timer langsung ke 60 menit setelah sukses
            setMinutesUntilUpdate(60);

            toast.success("Profil berhasil diperbarui");
        } catch (err) {
            console.error("Gagal update profil:", err);
            toast.error(err.response?.data?.message || "Gagal menyimpan profil");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page-loading">
                <Spinner animation="border" variant="warning" />
                <p className="mt-3 text-light">Memuat profil...</p>
            </div>
        );
    }

    if (!profile) return null;

    const joinedDateRaw = profile.createdAt || profile.created_at || (user && user.createdAt);
    const joinedDate = joinedDateRaw
        ? new Date(joinedDateRaw).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
        : "-";

    let rawRole = profile.role || "user";
    if (rawRole.toLowerCase() === "customer") rawRole = "user";
    const role = rawRole.toUpperCase();

    // Nama Header diambil dari PROFILE (bukan input form)
    const displayHeaderName = profile.displayName || profile.username || "User";
    const username = profile.username || profile.email?.split("@")[0] || "User";

    const watchlistCount = Array.isArray(watchlist) ? watchlist.length : 0;
    const userId = profile._id || profile.id || "-";

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="profile-header-left">
                    <div className="profile-avatar-large">
                        {getInitials(displayHeaderName, profile.email)}
                    </div>
                    <div className="profile-header-text">
                        <h1 className="profile-username">{displayHeaderName}</h1>
                        <div className="profile-meta-line">
                            <span className="profile-joined">
                                Bergabung {joinedDate}
                            </span>
                            <Badge bg={role === "ADMIN" ? "danger" : "secondary"} className="ms-2">
                                {role}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="profile-header-right">
                    <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => {
                            const el = document.getElementById("profile-edit-section");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                    >
                        <PencilSquare className="me-1" />
                        Edit Profil
                    </Button>
                </div>
            </header>

            <section className="profile-stats-section">
                <div className="profile-stat-card clickable" onClick={() => navigate("/my-reviews")}>
                    <div className="profile-stat-icon"><StarFill /></div>
                    <div className="profile-stat-label">Ratings</div>
                    <div className="profile-stat-value">{ratingCount}</div>
                </div>
                <div className="profile-stat-card clickable" onClick={() => navigate("/watchlist")}>
                    <div className="profile-stat-icon"><BookmarkFill /></div>
                    <div className="profile-stat-label">Watchlist</div>
                    <div className="profile-stat-value">{watchlistCount}</div>
                </div>
            </section>

            <section id="profile-edit-section" className="profile-content-section">
                <Container>
                    <Row>
                        <Col md={8} lg={6}>
                            <h4 className="text-light mb-4">Info Akun</h4>
                            <Form onSubmit={handleSave}>
                                {/* Nama Tampilan */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-light fw-semibold">Nama Tampilan</Form.Label>
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="bg-dark text-light border-secondary"
                                            placeholder="Masukkan nama tampilan"
                                            disabled={minutesUntilUpdate > 0}
                                        />
                                        <Button
                                            type="submit"
                                            variant="warning"
                                            disabled={saving || minutesUntilUpdate > 0}
                                        >
                                            {saving ? "..." : <><PencilSquare className="me-1" /> Simpan</>}
                                        </Button>
                                    </div>
                                    {minutesUntilUpdate > 0 ? (
                                        <Form.Text className="text-danger">
                                            Anda dapat mengganti nama lagi dalam {minutesUntilUpdate} menit.
                                        </Form.Text>
                                    ) : (
                                        <Form.Text className="text-muted">
                                            Nama ini muncul di profil publik. (Batas ganti: 1 jam sekali)
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                {/* Email (Read-only) */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-light fw-semibold">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={profile.email || ""}
                                        readOnly
                                        disabled
                                        className="bg-dark text-secondary border-secondary"
                                    />
                                </Form.Group>

                                {/* Info Tambahan */}
                                <Row className="mb-2">
                                    <Col xs={6}>
                                        <div className="text-secondary small">Tanggal bergabung</div>
                                        <div className="text-light">{joinedDate}</div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="text-secondary small">ID Pengguna</div>
                                        <div className="text-light text-truncate" title={userId}>
                                            {userId}
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}