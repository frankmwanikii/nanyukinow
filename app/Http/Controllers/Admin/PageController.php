<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SitePage;
use App\Support\AdminPagination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPagination::perPage($request);
        $page = max(1, $request->integer('page', 1));
        $all = SitePage::ordered();
        $total = $all->count();
        $items = $all
            ->slice(($page - 1) * $perPage, $perPage)
            ->map(fn (SitePage $sitePage) => $sitePage->toAdminArray())
            ->values();

        $pages = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ],
        );

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
            'filters' => [
                'per_page' => $perPage,
            ],
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
