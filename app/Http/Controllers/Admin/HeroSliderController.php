<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\HeroSlides;
use App\Support\ListingMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class HeroSliderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/HeroSlider/Index', [
            'slides' => HeroSlides::forHome(),
            'uploadUrl' => route('admin.hero-slider.upload'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slides' => ['required', 'array', 'min:1'],
            'slides.*.id' => ['nullable', 'string', 'max:64'],
            'slides.*.image' => ['required', 'string', 'max:2048'],
            'slides.*.imageMobile' => ['nullable', 'string', 'max:2048'],
            'slides.*.alt' => ['nullable', 'string', 'max:255'],
            'slides.*.title' => ['nullable', 'string', 'max:120'],
            'slides.*.credit' => ['nullable', 'string', 'max:160'],
            'slides.*.showOnDesktop' => ['sometimes', 'boolean'],
            'slides.*.showOnMobile' => ['sometimes', 'boolean'],
        ]);

        $saved = HeroSlides::save($data['slides']);

        if ($saved === []) {
            return back()->withErrors([
                'slides' => 'Add at least one slide with an image URL.',
            ]);
        }

        return back()->with('success', 'Hero slider updated.');
    }

    public function upload(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:10240',
            ],
        ], [
            'image.max' => 'Images must be 10MB or smaller.',
        ]);

        try {
            $url = ListingMedia::store($data['image'], 'site/hero');
        } catch (RuntimeException $e) {
            $message = str_contains($e->getMessage(), 'not writable')
                ? 'Could not save that image because storage is not writable. Please try again or contact support.'
                : 'Could not save that image. Try JPG, PNG, or WebP under 10MB.';

            return response()->json([
                'message' => $message,
                'errors' => ['image' => [$message]],
            ], 422);
        }

        return response()->json(['url' => $url], 201);
    }
}
