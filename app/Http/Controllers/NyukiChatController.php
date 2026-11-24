<?php

namespace App\Http\Controllers;

use App\Http\Requests\NyukiChatRequest;
use App\Support\Nyuki\NyukiChat;
use Illuminate\Http\JsonResponse;
use RuntimeException;
use Throwable;

class NyukiChatController extends Controller
{
    public function __invoke(NyukiChatRequest $request, NyukiChat $chat): JsonResponse
    {
        $data = $request->validated();
        $message = trim((string) $data['message']);
        /** @var list<array{role: string, content: string}> $history */
        $history = array_values($data['history'] ?? []);

        try {
            $result = $chat->reply($message, $history, $request->user());
        } catch (RuntimeException $e) {
            $lower = mb_strtolower($e->getMessage());
            $status = 502;
            $code = null;

            if (str_contains($lower, 'not connected')) {
                $status = 503;
            } elseif ($e->getCode() === 429 || str_contains($lower, 'peeked left')) {
                $status = 429;
                $code = 'busy';
            }

            return response()->json(array_filter([
                'message' => $e->getMessage(),
                'code' => $code,
            ], fn ($value) => $value !== null), $status);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Nyuki hit an unexpected error. Try again in a moment.',
            ], 500);
        }

        return response()->json([
            'reply' => $result['reply'],
            'citations' => $result['citations'],
            'follow_ups' => $result['follow_ups'],
            'explore_cta' => $result['explore_cta'],
            'model' => $result['model'],
        ]);
    }
}
