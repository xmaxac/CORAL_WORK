import SwiftUI
import MapKit

struct HomeStonyCoral: View {
    let locations: [LocationObject]
    
    var body: some View {
        
        ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(locations) { location in
                        NavigationLink(destination: DescriptionView(object: location)) {
                            coralButton(coral: location)
                        }
                        .padding(.trailing, 5)
                       
                    }
                    Spacer()
                }

            }
        
    }
    
}
#Preview {
    HomeStonyCoral(locations: LocationObject.sampleData)
}

struct coralButton: View {
    let coral: LocationObject
    var body: some View{
        VStack{
            HStack{
                Text(coral.title)
                    .padding(3)
                    .padding(.leading,  4)
                    .padding(.trailing, 4)
                    .fontWeight(.bold)
                    .background(.white)
                    .cornerRadius(12)
                Spacer()
            }
            Spacer()
        }
        .foregroundColor(.black)
        .padding(8)
        .frame(width: 200, height: 200)
        .background(
            ZStack{
                Color.white
                Image(coral.image)
                    .resizable()
                    .scaledToFill()
                    .clipped()
            }
        )
        .cornerRadius(12)
        .font(.title2)
        .shadow(radius: 5)
        .padding(8)
        
        
    }
}
