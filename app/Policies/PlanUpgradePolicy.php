<?php

namespace App\Policies;

use App\Models\PlanUpgrade;
use App\Models\User;

class PlanUpgradePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function cancel(User $user, PlanUpgrade $upgrade): bool
    {
        return (int) $upgrade->user_id === (int) $user->id
            && $upgrade->status === PlanUpgrade::STATUS_PENDING;
    }
}
