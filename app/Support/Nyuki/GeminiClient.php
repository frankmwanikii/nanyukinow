<?php

namespace App\Support\Nyuki;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiClient
{
    public function configured(): bool
    {
        return $this->apiKey() !== '';
    }

    public function apiKey(): string
    {
        return trim((string) config('services.gemini.api_key', ''));
    }

    public function model(): string
    {
        $model = trim((string) config('services.gemini.model', 'gemini-2.5-flash'));

        return $model !== '' ? $model : 'gemini-2.5-flash';
    }

    /**
     * @param  list<array{role: string, text: string}>  $turns
     * @return array{text: string, model: string}
     */
    public function generate(string $systemInstruction, array $turns): array
    {
        if (! $this->configured()) {
            throw new RuntimeException('Gemini is not configured.');
        }

        $contents = [];
        foreach ($turns as $turn) {
            $role = ($turn['role'] ?? '') === 'assistant' ? 'model' : 'user';
            $text = trim((string) ($turn['text'] ?? ''));
            if ($text === '') {
                continue;
            }
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $text]],
            ];
        }

        if ($contents === []) {
            throw new RuntimeException('No conversation content to send.');
        }

        $url = sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent',
            rawurlencode($this->model()),
        );

        try {
            $response = Http::connectTimeout(5)
                ->timeout(45)
                ->withHeaders([
                    'x-goog-api-key' => $this->apiKey(),
                    'Content-Type' => 'application/json',
                ])
                ->post($url, [
                    'systemInstruction' => [
                        'parts' => [['text' => $systemInstruction]],
                    ],
                    'contents' => $contents,
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 1024,
                    ],
                ]);
        } catch (ConnectionException $e) {
            throw new RuntimeException('Nyuki could not reach Gemini. Try again in a moment.', 0, $e);
        }

        if ($response->status() === 429) {
            throw new RuntimeException(
                'Nyuki peeked left, then right, and still needs a second. Try again in a moment.',
                429,
            );
        }

        if (! $response->successful()) {
            throw new RuntimeException(
                'Nyuki could not get an answer right now. Try again shortly.',
            );
        }

        $text = (string) data_get($response->json(), 'candidates.0.content.parts.0.text', '');
        $text = trim($text);

        if ($text === '') {
            throw new RuntimeException('Nyuki returned an empty answer. Try rephrasing your question.');
        }

        return [
            'text' => $text,
            'model' => $this->model(),
        ];
    }
}
