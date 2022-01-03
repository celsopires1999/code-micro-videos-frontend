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

}
