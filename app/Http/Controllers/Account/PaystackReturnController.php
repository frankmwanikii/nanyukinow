<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Support\PaystackFulfillment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaystackReturnController extends Controller
{
    /**
     * Paystack redirects here after checkout. Webhook remains the source of truth.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $reference = $request->string('reference')->toString();
        if ($reference === '') {
            $reference = $request->string('trxref')->toString();
        }

        $result = PaystackFulfillment::verifyAndActivate($reference);

        if ($result['ok']) {
            return redirect()
                ->route('account.billing')
                ->with('success', $result['message']);
        }

        return redirect()
            ->route('account.upgrade')
            ->with('error', $result['message']);
    }
}
