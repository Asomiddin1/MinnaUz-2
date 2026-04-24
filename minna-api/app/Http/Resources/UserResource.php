<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'avatar' => $this->avatar,
        'role' => $this->role,
        'coins' => (int) $this->coins,
        'streak' => (int) $this->streak,
        'last_login' => $this->last_login_at?->format('Y-m-d H:i:s'),
        'created_at' => $this->created_at->format('Y-m-d H:i:s'),
    ];
}
}
