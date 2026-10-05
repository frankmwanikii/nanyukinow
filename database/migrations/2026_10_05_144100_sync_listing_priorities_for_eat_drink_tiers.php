<?php

use App\Support\Membership;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Free=1, Standard=2, Premium=3. Keep admin-promoted (4+) as-is.
        DB::table('listings')
            ->where('priority', '<', Membership::PROMOTED_PRIORITY)
            ->where('tier', Membership::PREMIUM)
            ->update(['priority' => 3]);

        DB::table('listings')
            ->where('priority', '<', Membership::PROMOTED_PRIORITY)
            ->where('tier', Membership::STANDARD)
            ->update(['priority' => 2]);

        DB::table('listings')
            ->where('priority', '<', Membership::PROMOTED_PRIORITY)
            ->where(function ($q) {
                $q->whereNull('tier')->orWhere('tier', Membership::FREE);
            })
            ->update(['priority' => 1]);
    }

    public function down(): void
    {
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
};
