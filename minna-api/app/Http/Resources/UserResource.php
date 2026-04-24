<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'is_premium' => (bool) $this->is_premium,
            'coins' => (int) $this->coins,
            'streak' => (int) $this->streak,
            'device_limit' => method_exists($this, 'deviceLimit')
                ? $this->deviceLimit()
                : ($this->is_premium ? 5 : 2),

            'active_devices_count' => $this->whenLoaded('tokens', function () {
                return $this->tokens->count();
            }),
            'last_login_at' => $this->last_login_at?->format('Y-m-d H:i:s'),
            'email_verified_at' => $this->email_verified_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'is_active' => $this->tokens()->exists(),
        ];
    }
}