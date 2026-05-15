"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Edit,
  Wallet,
  IndianRupee,
  TrendingDown,
} from "lucide-react";
import { db } from "@/src/lib/firebase";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import Pagination from "@/src/components/shared/Pagination";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import EmptyState from "@/src/components/shared/EmptyState";
import { formatDate, formatCurrency, exportToCSV } from "@/src/lib/utils";
import { EXPENSE_CATEGORIES } from "@/src/lib/constants";
import { useAuth } from "@/src/context/AuthContext";

export default function GirlsExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    expense: null,
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!userProfile) return;
    fetchExpenses();
  }, [userProfile?.uid]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "girls_expenses"),
        orderBy("expenseDate", "desc"),
      );
      const snapshot = await getDocs(q);
      setExpenses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        searchQuery === "" ||
        expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        filters.category === "" || expense.category === filters.category;
      const matchesDateFrom =
        !filters.dateFrom || expense.expenseDate >= filters.dateFrom;
      const matchesDateTo =
        !filters.dateTo || expense.expenseDate <= filters.dateTo;
      return (
        matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo
      );
    });
  }, [expenses, searchQuery, filters]);

  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyAmount = filteredExpenses
      .filter((e) => e.expenseDate?.startsWith(thisMonth))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    return { total: filteredExpenses.length, totalAmount, monthlyAmount };
  }, [filteredExpenses]);

  const handleSelectAll = (e) => {
    if (e.target.checked)
      setSelectedExpenses(paginatedExpenses.map((e) => e.id));
    else setSelectedExpenses([]);
  };

  const handleSelectExpense = (id) => {
    setSelectedExpenses((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id],
    );
  };

  const handleDeleteExpense = async () => {
    if (!deleteDialog.expense) return;
    try {
      await deleteDoc(doc(db, "girls_expenses", deleteDialog.expense.id));
      setExpenses((prev) =>
        prev.filter((e) => e.id !== deleteDialog.expense.id),
      );
      toast.success("Expense deleted");
      setDeleteDialog({ open: false, expense: null });
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db);
      selectedExpenses.forEach((id) =>
        batch.delete(doc(db, "girls_expenses", id)),
      );
      await batch.commit();
      setExpenses((prev) =>
        prev.filter((e) => !selectedExpenses.includes(e.id)),
      );
      setSelectedExpenses([]);
      toast.success(`${selectedExpenses.length} expenses deleted`);
      setBulkDeleteDialog(false);
    } catch {
      toast.error("Failed to delete expenses");
    }
  };

  const handleExport = () => {
    const data = filteredExpenses.map((e) => ({
      Title: e.title,
      Category: e.category,
      Amount: e.amount,
      Vendor: e.vendor,
      Date: formatDate(e.expenseDate),
      Description: e.description,
    }));
    exportToCSV(data, "girls-expenses-export");
    toast.success("Export completed");
  };

  const clearFilters = () => {
    setFilters({ category: "", dateFrom: "", dateTo: "" });
    setSearchQuery("");
  };
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (loading) return <LoadingSkeleton type="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Track and manage girls hostel expenses"
        actions={
          <Link
            href="/girls/expenses/add"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md"
            style={{ background: "#1B4332" }}
          >
            <Plus size={16} /> Add Expense
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Expenses",
            value: stats.total,
            icon: Wallet,
            color: "rgba(27,67,50,0.08)",
            iconColor: "#1B4332",
          },
          {
            label: "Total Amount",
            value: formatCurrency(stats.totalAmount),
            icon: TrendingDown,
            color: "rgba(211,149,66,0.1)",
            iconColor: "#D39542",
          },
          {
            label: "This Month",
            value: formatCurrency(stats.monthlyAmount),
            icon: IndianRupee,
            color: "rgba(27,67,50,0.08)",
            iconColor: "#1B4332",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-md p-5"
            style={{ border: "1px solid #E8DFD4" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center"
                style={{ background: card.color }}
              >
                <card.icon size={18} style={{ color: card.iconColor }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "#8C7B6B" }}>
                  {card.label}
                </p>
                <p
                  style={{
                    fontFamily: "Newsreader, serif",
                    fontSize: 22,
                    color: "#1B4332",
                  }}
                >
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="bg-white rounded-md p-4"
        style={{ border: "1px solid #E8DFD4" }}
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#8C7B6B" }}
            />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 h-9 border rounded text-sm focus:outline-none"
              style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded"
            style={{ border: "1px solid #E8DFD4", color: "#3D3227" }}
          >
            <Filter size={14} /> Filters{" "}
            {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded"
            style={{ border: "1px solid #E8DFD4", color: "#3D3227" }}
          >
            <Download size={14} /> Export
          </button>
        </div>
        {showFilters && (
          <div
            className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-3 gap-3"
            style={{ borderTop: "1px solid #E8DFD4" }}
          >
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full h-9 border rounded px-2 text-sm focus:outline-none"
                style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
              >
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full h-9 border rounded px-2 text-sm"
                style={{ borderColor: "#E8DFD4" }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full h-9 border rounded px-2 text-sm"
                style={{ borderColor: "#E8DFD4" }}
              />
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs"
                style={{ color: "#D39542" }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {selectedExpenses.length > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-md"
          style={{ background: "#F5EFE8", border: "1px solid #E8DFD4" }}
        >
          <span className="text-sm" style={{ color: "#3D3227" }}>
            {selectedExpenses.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setBulkDeleteDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 rounded"
              style={{ border: "1px solid #fca5a5" }}
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              onClick={() => setSelectedExpenses([])}
              className="text-xs px-3"
              style={{ color: "#8C7B6B" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No expenses found"
          description="Track your first expense or adjust your filters"
          action={{ label: "Add Expense", href: "/girls/expenses/add" }}
        />
      ) : (
        <div
          className="bg-white rounded-md overflow-hidden"
          style={{ border: "1px solid #E8DFD4" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "#F5EFE8" }}>
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedExpenses.length === paginatedExpenses.length &&
                        paginatedExpenses.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  {["Expense", "Category", "Amount", "Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs uppercase tracking-wide"
                        style={{ color: "#8C7B6B" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-neutral-50"
                    style={{ borderBottom: "1px solid #E8DFD4" }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.includes(expense.id)}
                        onChange={() => handleSelectExpense(expense.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#3D3227" }}
                      >
                        {expense.title}
                      </p>
                      {expense.vendor && (
                        <p className="text-xs" style={{ color: "#8C7B6B" }}>
                          {expense.vendor}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: "#F5EFE8", color: "#3D3227" }}
                      >
                        {EXPENSE_CATEGORIES.find(
                          (c) => c.value === expense.category,
                        )?.label || expense.category}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-medium"
                      style={{ color: "#1B4332" }}
                    >
                      {formatCurrency(expense.amount)}
                    </td>
                    <td
                      className="px-4 py-3 text-sm"
                      style={{ color: "#8C7B6B" }}
                    >
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/girls/expenses/${expense.id}/edit`}
                          className="p-1 hover:bg-neutral-50 rounded"
                        >
                          <Edit size={14} color="#8C7B6B" />
                        </Link>
                        <button
                          onClick={() =>
                            setDeleteDialog({ open: true, expense })
                          }
                          className="p-1 hover:bg-neutral-50 rounded"
                        >
                          <Trash2 size={14} color="#8C7B6B" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div
              className="px-4 py-3"
              style={{ borderTop: "1px solid #E8DFD4" }}
            >
              <Pagination
                total={filteredExpenses.length}
                page={currentPage}
                pageSize={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, expense: null })}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        description={`Delete "${deleteDialog.expense?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
      <ConfirmDialog
        open={bulkDeleteDialog}
        onOpenChange={setBulkDeleteDialog}
        onConfirm={handleBulkDelete}
        title="Delete Selected Expenses"
        description={`Delete ${selectedExpenses.length} expenses? This cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
      />
    </div>
  );
}
