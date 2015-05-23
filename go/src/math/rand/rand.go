package rand

func ExpFloat64() float64  { return 0.0 }
func Float32() float32     { return 0.0 }
func Float64() float64     { return 0.0 }
func Int() int             { return 0 }
func Int31() int32         { return 0 }
func Int31n(n int32) int32 { return 0 }
func Int63() int64         { return 0 }
func Int63n(n int64) int64 { return 0 }
func Intn(n int) int       { return 0 }
func NormFloat64() float64 { return 0.0 }
func Perm(n int) []int     { return []int{} }
func Seed(seed int64)      {}
func Uint32() uint32       { return 0 }

type Rand int

func New(src Source) *Rand           { return nil }
func (r *Rand) ExpFloat64() float64  { return 0.0 }
func (r *Rand) Float32() float32     { return 0.0 }
func (r *Rand) Float64() float64     { return 0.0 }
func (r *Rand) Int() int             { return 0 }
func (r *Rand) Int31() int32         { return 0 }
func (r *Rand) Int31n(n int32) int32 { return 0 }
func (r *Rand) Int63() int64         { return 0 }
func (r *Rand) Int63n(n int64) int64 { return 0 }
func (r *Rand) Intn(n int) int       { return 0 }
func (r *Rand) NormFloat64() float64 { return 0.0 }
func (r *Rand) Perm(n int) []int     { return []int{} }
func (r *Rand) Seed(seed int64)      { return }
func (r *Rand) Uint32() uint32       { return 0 }

type Source int

func NewSource(seed int64) Source { return 0 }

type Zipf int

func NewZipf(r *Rand, s float64, v float64, imax uint64) *Zipf { return nil }
func (z *Zipf) Uint64() uint64                                 { return 0.0 }
