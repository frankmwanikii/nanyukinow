<?php

namespace App\Console\Commands;

use App\Support\ClaimPlanGrace;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('listings:process-claim-grace')]
#[Description('Demote claimed listings to Free after the post-claim plan grace window ends')]
class ProcessClaimPlanGraceCommand extends Command
{
    public function handle(): int
    {
        $expired = ClaimPlanGrace::expireDue();

        $this->info("Demoted to Free after claim grace: {$expired}");

        return self::SUCCESS;
    }
}
