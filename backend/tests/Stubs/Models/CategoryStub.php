<?php

namespace Tests\Stubs\Models;

use App\ModelFilters\CategoryFilter;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;

class CategoryStub extends Model
{
    use Filterable;
 
    protected $table = 'category_stubs';
    protected $fillable = ['name', 'description'];

    public static function createTable()
    {
        \Schema::create('category_stubs', function (Blueprint $table) {
            $table->bigIncrements('id');;
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public static function dropTable()
    {
        \Schema::dropIfExists('category_stubs');
    }

    public function modelFilter()
    {
        return $this->provideFilter(CategoryFilter::class);
    }
}
