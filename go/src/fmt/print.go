package fmt

type State interface {
	Write(b []byte) (ret int, err error)
	Width() (wid int, ok bool)
	Precision() (prec int, ok bool)
	Flag(c int) bool
}

type Formatter interface {
	Format(f State, c rune)
}

type Stringer interface {
	String() string
}

type GoStringer interface {
	GoString() string
}

//func Fprintf(w io.Writer, format string, a ...interface{}) (n int, err error) {
//	return
//}

func Printf(format string, a ...interface{}) (n int, err error) {
	return
}

func Sprintf(format string, a ...interface{}) string {
	return ""
}

func Errorf(format string, a ...interface{}) error {
	return nil
}

//func Fprint(w io.Writer, a ...interface{}) (n int, err error) {
//	return
//}

func Print(a ...interface{}) (n int, err error) {
	return
}

func Sprint(a ...interface{}) string {
	return ""
}

//func Fprintln(w io.Writer, a ...interface{}) (n int, err error) {
//	return
//}

func Println(a ...interface{}) (n int, err error) {
	return
}

func Sprintln(a ...interface{}) string {
	return ""
}
