import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Pagination from "../../components/LagAnalysis/Pagination";
import TableState from "../../components/LagAnalysis/TableState";
import TableSkeleton from "../../components/LagAnalysis/TableSkeleton";

/* ---------------- TYPES ---------------- */

interface Paper {
    paper_id: string;
    paper_title: string;
    paper_year: number;
    patent_title: string;
    patent_year: number;
    similarity: number;
    novelty: string;
}

interface RankedRow {
    rank: number;
    priority_score: number;
    paper: Paper;
}

interface ApiResponse {
    total: number;
    data: RankedRow[];
}

/* ---------------- PROPS ---------------- */

interface RankedPapersTableProps {
    apiUrl?: string;
}

/* ---------------- COMPONENT ---------------- */

const RankedPapersTable: React.FC<RankedPapersTableProps> = ({
    apiUrl = "http://localhost:8000/api/priority-ranked",
}) => {
    const [data, setData] = useState<RankedRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    /* ---------------- FETCH ---------------- */

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error("Failed to fetch data");

                const json: ApiResponse = await res.json();
                setData(json.data || []);
            } catch (err: any) {
                setError(err.message || "Error loading data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]);

    /* ---------------- FILTER ---------------- */

    const filtered = data.filter((r) =>
        r.paper.paper_title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / pageSize);

    const paginated = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    /* ---------------- UI ---------------- */

    return (
        <section>
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-container tracking-tight mb-2">
                    Priority Ranking of Scientific Papers
                </h1>
                <p className="text-on-surface-variant font-body max-w-2xl opacity-80">
                    Evaluating and ranking research papers based on a composite priority score derived from
                    similarity to patents, novelty contribution, and overall technological impact across domains.
                </p>
            </header>

            {/* Search */}
            <div className="p-6 flex items-center gap-4 bg-surface-container-low/50">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3 text-outline-variant w-4 h-4" />
                    <input
                        className="w-full bg-surface-container-highest rounded-xl pl-12 pr-4 py-3 text-sm outline-none"
                        placeholder="Search papers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low text-left">
                            <th className="px-8 py-5 text-xs font-bold text-left">Rank</th>
                            <th className="px-8 py-5 text-xs font-bold">Paper</th>
                            <th className="px-6 py-4 text-xs font-bold text-center">Year</th>
                            <th className="px-8 py-5 text-xs font-bold">Patent</th>
                            <th className="px-8 py-5 text-xs font-bold text-center">Year</th>
                            <th className="px-8 py-5 text-xs font-bold text-right">Score</th>
                            <th className="px-8 py-5 text-xs font-bold text-right">Similarity</th>
                            <th className="px-8 py-5 text-xs font-bold text-right">Novelty</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={8} />
                        ) : error ? (
                            <tr>
                                <td colSpan={8}>
                                    <TableState
                                        type="error"
                                        message="Failed to load ranked papers"
                                        onRetry={() => window.location.reload()}
                                    />
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={8}>
                                    <TableState type="empty" />
                                </td>
                            </tr>
                        ) : (
                            paginated.map((r) => (
                                <tr key={r.paper.paper_id} className="hover:bg-primary/5 transition-colors group">

                                    <td className="px-6 py-5 font-bold text-primary">
                                        {r.rank}
                                    </td>

                                    <td className="px-6 py-5 font-semibold">
                                        {r.paper.paper_title}
                                    </td>

                                    <td className="px-6 py-5 text-center text-on-surface-variant">
                                        {r.paper.paper_year}
                                    </td>

                                    <td className="px-6 py-5">
                                        {r.paper.patent_title}
                                    </td>

                                    <td className="px-6 py-5 text-center text-on-surface-variant">
                                        {r.paper.patent_year}
                                    </td>

                                    <td className="px-6 py-5 text-right font-bold text-secondary">
                                        {r.priority_score.toFixed(2)}
                                    </td>

                                    <td className="px-6 py-5 text-right text-tertiary">
                                        {r.paper.similarity.toFixed(3)}
                                    </td>

                                    <td className="px-6 py-5 text-right text-error">
                                        {r.paper.novelty}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex justify-between items-center">
                <p className="text-xs">
                    Showing {paginated.length} of {filtered.length}
                </p>

                <div className="flex items-center gap-3">
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="bg-surface-container-high px-3 py-1 rounded-md text-xs"
                    >
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                    </select>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </section>
    );
};

export default RankedPapersTable;