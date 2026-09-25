<?php

use App\Support\Membership;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Keep admin-promoted (priority 4+) as-is; sync the rest from plan tier.
        DB::table('listings')
            ->where('priority', '<', Membership::PROMOTED_PRIORITY)
            ->where('tier', Membership::PREMIUM)
            ->update(['priority' => 3]);

        DB::table('listings')
            ->where('priority', '<', Membership::PROMOTED_PRIORITY)
            ->where('tier', Membership::STANDARD)
            ->update(['priority' => 1]);

        DB::table('listings')
            ->where('priority', '<', Membership::PROMOTED_PRIORITY)
            ->where(function ($q) {
                $q->whereNull('tier')->orWhere('tier', Membership::FREE);
            })
            ->update(['priority' => 0]);
    }

    public function down(): void
    {
        // Irreversible backfill.
    }
};
