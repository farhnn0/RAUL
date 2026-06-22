import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../App";
import toast from "react-hot-toast";

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
    const [editBio, setEditBio] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingName, setSavingName] = useState(false);
    const [savingBio, setSavingBio] = useState(false);
    const [ratingCount, setRatingCount] = useState(0);
    const [minutesUntilUpdate, setMinutesUntilUpdate] = useState(0);

    useEffect(() => {
        if (!user) { navigate("/signin"); return; }
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [profileRes, reviewsRes] = await Promise.all([
                    api.get("/users/profile"),
                    api.get("/reviews/my-reviews"),
                ]);
                const merged = { ...user, ...profileRes.data };
                setProfile(merged);
                setEditName(merged.displayName || merged.username || "");
                setEditBio(merged.bio || "");

                if (merged.lastDisplayNameUpdate) {
                    const diffMs = new Date() - new Date(merged.lastDisplayNameUpdate);
                    const diffMin = Math.floor(diffMs / 60000);
                    if (diffMin < 60) setMinutesUntilUpdate(60 - diffMin);
                    else setMinutesUntilUpdate(0);
                }

                const reviewsData = reviewsRes.data;
                setRatingCount(Array.isArray(reviewsData) ? reviewsData.length : 0);
            } catch (err) {
                console.error("Gagal memuat profil:", err);
                toast.error("Gagal memuat data profil");
                if (user) { 
                    setProfile(user); 
                    setEditName(user.displayName || user.username || ""); 
                    setEditBio(user.bio || "");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user, navigate]);

    const handleSaveName = async (e) => {
        e.preventDefault();
        if (!editName.trim()) { toast.error("Nama tidak boleh kosong"); return; }
        if (minutesUntilUpdate > 0) { toast.error(`Anda bisa mengganti nama lagi dalam ${minutesUntilUpdate} menit`); return; }

        setSavingName(true);
        try {
            const userId = profile?._id || profile?.id;
            const payload = { displayName: editName.trim(), lastDisplayNameUpdate: new Date().toISOString() };
            const res = await api.patch(`/users/update/${userId}`, payload);
            const updated = res.data?.user || res.data || {};
            setProfile((prev) => ({ ...prev, ...updated, displayName: payload.displayName, lastDisplayNameUpdate: payload.lastDisplayNameUpdate }));
            setUser((prev) => ({ ...prev, displayName: payload.displayName, lastDisplayNameUpdate: payload.lastDisplayNameUpdate }));
            setMinutesUntilUpdate(60);
            toast.success("Nama berhasil diperbarui");
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menyimpan nama");
        } finally {
            setSavingName(false);
        }
    };

    const handleSaveBio = async (e) => {
        e.preventDefault();
        setSavingBio(true);
        try {
            const userId = profile?._id || profile?.id;
            const payload = { bio: editBio.trim() };
            const res = await api.patch(`/users/update/${userId}`, payload);
            const updated = res.data?.user || res.data || {};
            setProfile((prev) => ({ ...prev, ...updated, bio: payload.bio }));
            setUser((prev) => ({ ...prev, bio: payload.bio }));
            toast.success("Bio berhasil diperbarui");
        } catch (err) {
            toast.error(err.response?.data?.message || "Gagal menyimpan bio");
        } finally {
            setSavingBio(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-primary/20"></div>
                <p className="mt-4 text-text-secondary">Loading profile...</p>
            </div>
        );
    }
    if (!profile) return null;

    const joinedDateRaw = profile.createdAt || profile.created_at || user?.createdAt;
    const joinedMonth = joinedDateRaw ? new Date(joinedDateRaw).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "-";
    const rawRole = (profile.role || "user").toLowerCase();
    const role = rawRole === "customer" ? "user" : rawRole;
    const displayName = profile.displayName || profile.username || "User";

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* ── Hero Section ── */}
            <section className="relative py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-5" />
                <div className="max-w-[1280px] mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                        {/* Avatar */}
                        <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl border-2 border-primary/40 p-1 shrink-0 overflow-hidden group mx-auto md:mx-0">
                            <div className="w-full h-full rounded-lg bg-surface-card flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                <span className="text-5xl font-heading font-bold text-primary">{getInitials(displayName, profile.email)}</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary">{displayName}</h1>
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border ${
                                    role === "admin"
                                        ? "bg-red-900/30 text-red-400 border-red-500/30"
                                        : "bg-primary/10 text-primary border-primary/30"
                                }`}>
                                    {role === "admin" ? "Admin" : "Pro Critic"}
                                </span>
                            </div>
                            <p className="text-sm text-text-muted font-medium tracking-wider uppercase mb-6">Joined {joinedMonth}</p>

                            <p className="text-lg text-text-secondary max-w-2xl leading-relaxed italic mb-10">
                                "{profile.bio || "A purveyor of visual storytelling, obsessing over the interplay of shadow and light."}"
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-outline-variant/40 pt-10">
                                <div>
                                    <span className="block text-3xl font-heading font-bold text-primary">{ratingCount}</span>
                                    <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Movies Rated</span>
                                </div>
                                <div>
                                    <span className="block text-3xl font-heading font-bold text-primary">{Array.isArray(watchlist) ? watchlist.length : 0}</span>
                                    <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Watchlist</span>
                                </div>
                                <div>
                                    <span className="block text-3xl font-heading font-bold text-primary">{ratingCount}</span>
                                    <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Reviews Written</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Bento Grid ── */}
            <section className="max-w-[1280px] mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Edit Profile + Info */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Edit Profile Card */}
                        <div className="bg-surface-card rounded-xl p-8 border border-outline-variant/60">
                            <h2 className="text-xl font-heading font-semibold text-text-primary mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">settings</span>
                                Account Info
                            </h2>
                            <div className="space-y-6">
                                {/* Form Display Name */}
                                <form onSubmit={handleSaveName}>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Display Name</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            disabled={minutesUntilUpdate > 0}
                                            className="flex-1 bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                                            placeholder="Enter display name"
                                        />
                                        <button
                                            type="submit"
                                            disabled={savingName || minutesUntilUpdate > 0}
                                            className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider disabled:opacity-50"
                                        >
                                            {savingName ? "..." : "Save Name"}
                                        </button>
                                    </div>
                                    {minutesUntilUpdate > 0 && (
                                        <p className="text-red-400 text-xs mt-1">You can change your name again in {minutesUntilUpdate} minutes.</p>
                                    )}
                                    {minutesUntilUpdate === 0 && (
                                        <p className="text-text-muted text-xs mt-1">This name appears on your public profile. (Limit: once per hour)</p>
                                    )}
                                </form>

                                {/* Form Bio / Quote */}
                                <form onSubmit={handleSaveBio} className="space-y-2">
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Bio / Quote</label>
                                    <div className="flex flex-col gap-3">
                                        <textarea
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            rows={3}
                                            className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary"
                                            placeholder="Write a movie quote or a brief description of yourself..."
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={savingBio}
                                                className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-lg hover:bg-gold-hover transition-all text-sm uppercase tracking-wider disabled:opacity-50"
                                            >
                                                {savingBio ? "Saving..." : "Save Bio"}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email || ""}
                                        readOnly
                                        disabled
                                        className="w-full bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 text-text-muted text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/30">
                                    <div>
                                        <div className="text-xs text-text-muted">Joined</div>
                                        <div className="text-sm text-text-primary mt-1">{joinedMonth}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-text-muted">User ID</div>
                                        <div className="text-sm text-text-primary mt-1 truncate">{profile._id || profile.id || "-"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate("/my-reviews")}
                                className="bg-surface-card border border-outline-variant/60 rounded-xl p-6 hover:border-primary transition-all text-left"
                            >
                                <span className="material-symbols-outlined text-primary text-[32px] mb-3 block">star</span>
                                <div className="text-2xl font-heading font-bold text-primary">{ratingCount}</div>
                                <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Reviews</div>
                            </button>
                            <button
                                onClick={() => navigate("/watchlist")}
                                className="bg-surface-card border border-outline-variant/60 rounded-xl p-6 hover:border-primary transition-all text-left"
                            >
                                <span className="material-symbols-outlined text-primary text-[32px] mb-3 block">bookmark</span>
                                <div className="text-2xl font-heading font-bold text-primary">{Array.isArray(watchlist) ? watchlist.length : 0}</div>
                                <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Watchlist</div>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Stats */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Curator Insights */}
                        <div className="bg-primary/90 p-8 rounded-xl text-on-primary relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xl font-heading font-bold mb-4 leading-tight">Curator Insights</h3>
                                <p className="text-sm mb-6 opacity-80">Your ratings shape the community's taste profile.</p>
                                <button
                                    onClick={() => navigate("/")}
                                    className="w-full bg-black text-primary py-3 rounded-lg font-bold text-sm hover:bg-gray-900 transition-all uppercase tracking-widest"
                                >
                                    Explore Films
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-1000">
                                <span className="material-symbols-outlined text-[120px]">equalizer</span>
                            </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="bg-surface-card rounded-xl p-8 border border-outline-variant/60">
                            <h2 className="text-xl font-heading font-semibold text-text-primary mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">history</span>
                                Activity Summary
                            </h2>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-text-secondary text-sm">Total Reviews</span>
                                    <span className="text-primary font-bold text-lg">{ratingCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-text-secondary text-sm">Watchlist Items</span>
                                    <span className="text-primary font-bold text-lg">{Array.isArray(watchlist) ? watchlist.length : 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-text-secondary text-sm">Member Since</span>
                                    <span className="text-primary font-bold text-sm">{joinedMonth}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-text-secondary text-sm">Role</span>
                                    <span className="text-primary font-bold text-sm uppercase">{role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
