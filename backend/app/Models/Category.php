<?php

namespace App\Models;

use App\ModelFilters\CategoryFilter;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes, Traits\Uuid, Filterable;

    protected $fillable = ['name', 'description', 'is_active'];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'is_active' => 'boolean'
    ];
    public $incrementing = false;
    protected $keyType = 'string';
    // protected $casts = [
    //     'id' => 'string'
    // ];

    public function modelFilter()
    {
        return $this->provideFilter(CategoryFilter::class);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class)->withTrashed();
    }
}
