import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { PageProps, Todo } from '@/types';
import { FormEventHandler, useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function Index({ auth, todos }: PageProps<{ todos: Todo[] }>) {
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [showForm, setShowForm] = useState(false); // Toggle form tambah tugas

    // Helper form menggunakan hook useForm dari Inertia
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        due_date: '',
    });

    // Proses simpan tugas ke database
    const handleAddTodo: FormEventHandler = (e) => {
        e.preventDefault();
        
        post(route('todos.store'), {
            onSuccess: () => {
                reset(); // Kosongkan form
                setShowForm(false); // Tutup form
            },
        });
    };

    // Logika filter berdasarkan tab yang dipilih
    const filteredTasks = todos.filter((item) => {
        if (filter === 'active') return !item.is_completed;
        if (filter === 'completed') return item.is_completed;
        return true;
    });

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Daftar Tugasku
                </h2>
            }
        >
            <Head title="Todos" />

            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Statistik & Aksi Utama */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ada rencana apa hari ini?</h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                Kamu punya {todos.filter(t => !t.is_completed).length} tugas yang belum selesai
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95 dark:shadow-none"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Tambah Tugas
                        </button>
                    </div>

                    {/* Form Tugas Baru */}
                    {showForm && (
                        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white/50 p-6 shadow-xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50">
                            <form onSubmit={handleAddTodo} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul Tugas</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-gray-200 bg-white/50 px-4 py-3 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                                        placeholder="Tulis apa yang perlu dikerjakan..."
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan (Opsional)</label>
                                        <textarea
                                            value={data.description || ''}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-200 bg-white/50 px-4 py-3 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                                            placeholder="Tambah detail rincian..."
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tenggat Waktu</label>
                                        <div className="relative mt-1">
                                            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={data.due_date}
                                                onChange={(e) => setData('due_date', e.target.value)}
                                                className="block w-full rounded-xl border-gray-200 bg-white/50 pl-10 pr-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-50 dark:shadow-none"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Tugas'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab Filter */}
                    <div className="mb-6 flex space-x-1 rounded-xl bg-gray-100/50 p-1 dark:bg-gray-800/50">
                        {([
                            { id: 'all', label: 'Semua' },
                            { id: 'active', label: 'Aktif' },
                            { id: 'completed', label: 'Selesai' }
                        ] as const).map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setFilter(t.id)}
                                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                                    filter === t.id
                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Daftar Todo */}
                    <div className="space-y-3">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((todo) => (
                                <div
                                    key={todo.id}
                                    className={`group flex items-center justify-between rounded-2xl border bg-white p-4 transition-all hover:shadow-md dark:bg-gray-900 ${
                                        todo.is_completed 
                                            ? 'border-transparent bg-gray-50 dark:bg-gray-800/40 opacity-75' 
                                            : 'border-gray-100 dark:border-gray-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            className="focus:outline-none"
                                            onClick={() => router.patch(route('todos.toggle', todo.id))}
                                        >
                                            <div 
                                                className={`rounded-full p-1 transition-colors ${
                                                    todo.is_completed 
                                                        ? 'text-green-500 hover:text-green-600' 
                                                        : 'text-gray-300 hover:text-indigo-500'
                                                }`}
                                            >
                                                {todo.is_completed ? (
                                                    <CheckCircle className="h-6 w-6" />
                                                ) : (
                                                    <Circle className="h-6 w-6" />
                                                )}
                                            </div>
                                        </button>
                                        <div>
                                            <h3 className={`font-semibold ${
                                                todo.is_completed 
                                                    ? 'text-gray-400 line-through' 
                                                    : 'text-gray-900 dark:text-white'
                                            }`}>
                                                {todo.title}
                                            </h3>
                                            {(todo.description || todo.due_date) && (
                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                    {todo.description && (
                                                        <span className="max-w-xs truncate">{todo.description}</span>
                                                    )}
                                                    {todo.due_date && (
                                                        <span className="flex items-center">
                                                            <Clock className="mr-1 h-3.1 w-3.1" />
                                                            {format(new Date(todo.due_date), 'MMM d, yyyy')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                if (confirm('Yakin ingin menghapus tugas ini?')) {
                                                    router.delete(route('todos.destroy', todo.id));
                                                }
                                            }}
                                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-4 rounded-full bg-gray-50 p-6 dark:bg-gray-800">
                                    <ChevronDown className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Semua beres!</h3>
                                <p className="mt-1 text-gray-500 dark:text-gray-400">
                                    {filter === 'all' 
                                        ? "Mulai dengan menambah tugas baru ke dalam daftar."
                                        : `Belum ada tugas di kategori ${filter === 'active' ? 'aktif' : 'selesai'}.`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
