<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use App\Http\Requests\StoreTodoRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TodoController extends Controller
{
    /**
     * Tampilkan daftar tugas utama untuk user yang sedang login.
     */
    public function index()
    {
        // Ambil data todo, urutkan dari yang terbaru
        $todos = Auth::user()
            ->todos()
            ->latest()
            ->get();
        
        return Inertia::render('Todos/Index', [
            'todos' => $todos
        ]);
    }

    /**
     * Proses tambah tugas baru.
     */
    public function store(StoreTodoRequest $request)
    {
        // Gunakan relationship user untuk memastikan keamanan data
        Auth::user()->todos()->create($request->validated());

        return redirect()->back()
            ->with('message', 'Mantap! Tugas baru berhasil ditambahkan.');
    }

    /**
     * Update detail tugas yang sudah ada.
     */
    public function update(StoreTodoRequest $request, Todo $todo)
    {
        // Cek kepemilikan data via policy
        $this->authorize('update', $todo);

        $todo->update($request->validated());

        return redirect()->back()
            ->with('message', 'Data tugas berhasil diperbarui.');
    }

    /**
     * Hapus tugas secara permanen.
     */
    public function destroy(Todo $todo)
    {
        $this->authorize('delete', $todo);

        $todo->delete();

        return redirect()->back()
            ->with('message', 'Tugas telah dihapus dari daftar.');
    }

    /**
     * Toggle status tugas (selesai/belum selesai).
     */
    public function toggleStatus(Todo $todo)
    {
        $this->authorize('update', $todo);

        // Balikkan nilai boolean is_completed
        $todo->update([
            'is_completed' => !$todo->is_completed
        ]);

        $statusMsg = $todo->is_completed ? 'Tugas ditandai selesai!' : 'Tugas dikembalikan ke daftar aktif.';

        return redirect()->back()
            ->with('message', $statusMsg);
    }
}
