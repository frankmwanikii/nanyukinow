<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SitePage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        $pages = SitePage::ordered()->map(fn (SitePage $page) => $page->toAdminArray());

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
        ]);
    }

    public function edit(SitePage $page): Response
    {
        SitePage::ensureDefaults();

        return Inertia::render('Admin/Pages/Edit', [
            'page' => $page->fresh()->toAdminArray(),
        ]);
    }

    public function update(Request $request, SitePage $page): RedirectResponse
    {
        $fieldKeys = collect($page->fieldSchema())->pluck('key')->all();

        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'meta_title' => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_published' => ['sometimes', 'boolean'],
            'content' => ['nullable', 'array'],
            'content.*' => ['nullable', 'string'],
        ]);

        $content = [];
        foreach ($fieldKeys as $key) {
            $content[$key] = isset($data['content'][$key])
                ? (string) $data['content'][$key]
                : (string) data_get($page->content, $key, '');
        }

        $page->update([
            'title' => $data['title'],
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'is_published' => (bool) ($data['is_published'] ?? $page->is_published),
            'content' => $content,
        ]);

        return redirect()
            ->route('admin.pages.edit', $page)
            ->with('success', "{$page->title} page saved.");
    }
}
