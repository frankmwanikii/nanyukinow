<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Support\AdminArea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomAdminPathTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        putenv('ADMIN_PATH=nn-desk-test');
        $_ENV['ADMIN_PATH'] = 'nn-desk-test';
        $_SERVER['ADMIN_PATH'] = 'nn-desk-test';

        parent::setUp();
    }

    protected function tearDown(): void
    {
        putenv('ADMIN_PATH=admin');
        $_ENV['ADMIN_PATH'] = 'admin';
        $_SERVER['ADMIN_PATH'] = 'admin';

        parent::tearDown();
    }

    public function test_custom_admin_path_serves_login_and_hides_classic_admin(): void
    {
        $this->assertSame('nn-desk-test', AdminArea::path());

        $this->get('/nn-desk-test/login')->assertOk();
        $this->get('/admin/login')->assertNotFound();
        $this->get('/admin')->assertNotFound();
    }

    public function test_admin_can_sign_in_on_custom_path(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
            'is_admin' => true,
        ]);

        $this->post('/nn-desk-test/login', [
            'login' => 'admin@example.com',
            'password' => 'password',
        ])->assertRedirect('/nn-desk-test');
    }
}
