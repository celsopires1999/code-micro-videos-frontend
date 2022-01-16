<?php

namespace App\ModelFilters;

// use Illuminate\Database\Eloquent\Builder;

class CategoryFilter extends DefaultModelFilter
{
    protected $sortable = ['name', 'is_active', 'created_at'];

    public function search($search)
    {
        $this->where('name', 'LIKE', "%$search%");
    }

    public function isActive($is_active)
    {
        $is_active_ = filter_var($is_active, FILTER_VALIDATE_BOOL);
        $this->where('is_active', $is_active_);
    }
}
