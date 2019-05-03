import java.io.*;

public class Hello {
    public static void main(String[] args) {

      int test[] = new int[10];

      try {
        FileOutputStream fos = new FileOutputStream("test.txt");
        ObjectOutputStream oos = new ObjectOutputStream(fos);
        oos.writeObject(test);

      } catch (Exception e) {

      }

    }
}
