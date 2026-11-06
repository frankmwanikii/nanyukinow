<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Support\PaypalFulfillment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaypalWebhookController extends Controller
{
    /**
     * PayPal posts the order result here. A confirmed capture activates the member plan.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $result = PaypalFulfillment::handleWebhook($request->json()->all());

        return response()->json($result['body'], $result['status']);
    }
}
