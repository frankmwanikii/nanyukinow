<?php

namespace App\Console\Commands;

use App\Support\PalplussFulfillment;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('payments:confirm-palpluss')]
#[Description('Activate plans for Palpluss payments that have already succeeded')]
class ConfirmPalplussPayments extends Command
{
    public function handle(): int
    {
        $confirmed = PalplussFulfillment::confirmOutstanding();
        $this->info('Activated '.$confirmed.' Palpluss payment(s).');

        return self::SUCCESS;
    }
}
