<?php

use App\Models\CastMember;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;

class VideosTableSeeder extends Seeder
{
    private $allGenres;
    private $allCastMembers;
    private $relations = [
        'genres_id' => [],
        'categories_id' => [],
        'cast_members_id' => []
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dir = \Storage::getDriver()->getAdapter()->getPathPrefix();
        \File::deleteDirectory($dir, true);

        $self = $this;
        $this->allGenres = Genre::all();
        $this->allCastMembers = CastMember::all();
        Model::reguard();
        factory(\App\Models\Video::class, 100)
            ->make()
            ->each(function (Video $video) use ($self) {
                $self->fetchRelations();
                \App\Models\Video::create(
                    array_merge(
                        $video->toArray(),
                        [
                            'thumb_file' => $self->getImageFile(),
                            'banner_file' => $self->getImageFile(),
                            'trailer_file' => $self->getVideoFile(),
                            'video_file' => $self->getVideoFile(),
                        ],
                        $this->relations
                    )
                );
            });
        Model::unguard();    
    }

    public function fetchRelations()
    {
        $subGenres = $this->allGenres->random(5)->load('categories');
        $categoriesId = [];
        foreach ($subGenres as $genre) {
            array_push($categoriesId, ...$genre->categories->pluck('id')->toArray());
        }
        $categoriesId = array_unique($categoriesId);
        $genresId = $subGenres->pluck('id')->toArray();
        $this->relations['categories_id'] = $categoriesId;
        $this->relations['genres_id'] = $genresId;
        $this->relations['cast_members_id'] = $this->allCastMembers->random(3)->pluck('id')->toArray();
    }

    public function getImageFile()
    {
        return new UploadedFile(
            storage_path('faker/thumbs/Palmeiras Escudo.png'),
            'Palmeiras Escudo.png'
        );
    }

    public function getVideoFile()
    {
        return new UploadedFile(
            storage_path('faker/videos/01-Gol Palmeiras contra Atl??tico Mineiro.mp4'),
            '01-Gol Palmeiras contra Atl??tico Mineiro.mp4'
        );
    }
}
