<?php

namespace Tests\Feature;

use App\Support\EventsTierFeatures;
use App\Support\Membership;
use App\Support\PropertiesTierFeatures;
use App\Support\ServicesTierFeatures;
use App\Support\ThingsToDoTierFeatures;
use Tests\TestCase;

class RemainingCategoryTierFeaturesTest extends TestCase
{
    public function test_properties_free_strips_standard_and_premium_fields(): void
    {
        $payload = PropertiesTierFeatures::applyToPayload([
            'description' => '<p>'.implode(' ', array_fill(0, 200, 'word')).'</p>',
            'tagline' => 'Hillside home',
            'latitude' => -0.02,
            'longitude' => 37.07,
            'email' => 'agent@example.com',
            'whatsapp' => '0712345678',
            'website' => 'https://example.com',
            'logo_url' => '/storage/logo.png',
            'amenities' => ['parking'],
            'gallery' => array_fill(0, 12, '/storage/a.jpg'),
            'details' => [
                'bedrooms' => '3',
                'bathrooms' => '2',
                'price' => 'KES 18M',
                'size_sqm' => '220',
                'furnished' => 'Furnished',
                'highlights' => ['Quiet'],
                'agent_name' => 'Jane',
                'video_url' => 'https://youtube.com/watch?v=abc',
                'virtual_tour_url' => 'https://tour.example.com',
            ],
        ], Membership::FREE, 'properties');

        $this->assertLessThanOrEqual(
            150,
            count(preg_split('/\s+/', trim(strip_tags($payload['description'])), -1, PREG_SPLIT_NO_EMPTY) ?: []),
        );
        $this->assertNull($payload['tagline']);
        $this->assertNull($payload['latitude']);
        $this->assertNull($payload['email']);
        $this->assertSame([], $payload['amenities']);
        $this->assertSame([], $payload['gallery']);
        $this->assertSame('3', $payload['details']['bedrooms']);
        $this->assertSame('KES 18M', $payload['details']['price']);
        $this->assertArrayNotHasKey('size_sqm', $payload['details']);
        $this->assertArrayNotHasKey('video_url', $payload['details']);
        $this->assertSame(0, PropertiesTierFeatures::galleryLimit(Membership::FREE));
        $this->assertSame(10, PropertiesTierFeatures::galleryLimit(Membership::STANDARD));
        $this->assertSame(40, PropertiesTierFeatures::galleryLimit(Membership::PREMIUM));
    }

    public function test_things_to_do_standard_keeps_experience_fields(): void
    {
        $payload = ThingsToDoTierFeatures::applyToPayload([
            'gallery' => array_fill(0, 12, '/storage/a.jpg'),
            'details' => [
                'duration' => 'Half day',
                'difficulty' => 'Easy',
                'included' => ['Guide'],
                'bring' => ['Water'],
                'booking_url' => 'https://book.example.com',
                'deals' => [['title' => 'Offer']],
            ],
        ], Membership::STANDARD, 'thingsToDo');

        $this->assertCount(8, $payload['gallery']);
        $this->assertSame(['Guide'], $payload['details']['included']);
        $this->assertArrayNotHasKey('booking_url', $payload['details']);
        $this->assertArrayNotHasKey('deals', $payload['details']);
    }

    public function test_services_portfolio_limits_and_free_strips(): void
    {
        $this->assertSame(0, ServicesTierFeatures::portfolioLimit(Membership::FREE));
        $this->assertSame(5, ServicesTierFeatures::portfolioLimit(Membership::STANDARD));
        $this->assertSame(25, ServicesTierFeatures::portfolioLimit(Membership::PREMIUM));

        $free = ServicesTierFeatures::applyToPayload([
            'details' => [
                'service_area' => 'Nanyuki',
                'offerings' => ['Repair'],
                'portfolio' => [
                    ['title' => 'Job 1', 'url' => 'https://example.com/1'],
                ],
                'credentials' => ['Licensed'],
            ],
        ], Membership::FREE, 'services');

        $this->assertSame('Nanyuki', $free['details']['service_area']);
        $this->assertArrayNotHasKey('portfolio', $free['details']);
        $this->assertArrayNotHasKey('credentials', $free['details']);

        $standard = ServicesTierFeatures::applyToPayload([
            'details' => [
                'portfolio' => array_fill(0, 8, ['title' => 'Job', 'url' => 'https://example.com']),
            ],
        ], Membership::STANDARD, 'services');

        $this->assertCount(5, $standard['details']['portfolio']);
    }

    public function test_events_ticket_and_sponsor_gating(): void
    {
        $free = EventsTierFeatures::applyToPayload([
            'ticket_price' => 'KES 1,000',
            'ticket_url' => 'https://tickets.example.com',
            'gallery' => array_fill(0, 5, '/storage/a.jpg'),
            'details' => [
                'organiser' => 'Town Crew',
                'age_limit' => '18+',
                'agenda' => [['time' => '19:00', 'title' => 'Open']],
                'sponsors' => [['name' => 'Brand']],
            ],
        ], Membership::FREE, 'events');

        $this->assertNull($free['ticket_price']);
        $this->assertNull($free['ticket_url']);
        $this->assertSame([], $free['gallery']);
        $this->assertSame('Town Crew', $free['details']['organiser']);
        $this->assertArrayNotHasKey('age_limit', $free['details']);
        $this->assertArrayNotHasKey('agenda', $free['details']);
        $this->assertArrayNotHasKey('sponsors', $free['details']);

        $premium = EventsTierFeatures::applyToPayload([
            'ticket_url' => 'https://tickets.example.com',
            'details' => [
                'sponsors' => array_fill(0, 25, ['name' => 'Brand']),
                'agenda' => array_fill(0, 50, ['time' => '19:00', 'title' => 'Act']),
            ],
        ], Membership::PREMIUM, 'events');

        $this->assertSame('https://tickets.example.com', $premium['ticket_url']);
        $this->assertCount(20, $premium['details']['sponsors']);
        $this->assertCount(40, $premium['details']['agenda']);
    }
}
