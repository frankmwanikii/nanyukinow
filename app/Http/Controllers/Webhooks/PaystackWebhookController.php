<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Support\PaystackFulfillment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaystackWebhookController extends Controller
{
    /**
     * Paystack posts charge results here. A verified success activates the member plan.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $payload = $request->json()->all();
        if (! is_array($payload)) {
            $payload = [];
        }

        $result = PaystackFulfillment::handleWebhook(
            $payload,
            $request->header('x-paystack-signature'),
            $rawBody,
        );

        return response()->json($result['body'], $result['status']);
    }
}
