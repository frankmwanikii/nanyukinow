<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Support\PaypalFulfillment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaypalReturnController extends Controller
{
    /**
     * PayPal sends the buyer here after they approve the order.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $result = PaypalFulfillment::captureAndActivate($request->string('token')->toString());

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
