<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Support\PalplussFulfillment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PalplussWebhookController extends Controller
{
    /**
     * Palpluss posts the STK result here. A confirmed success activates the member plan.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $result = PalplussFulfillment::handle($request->json()->all());

        return response()->json($result['body'], $result['status']);
    }
}
