import csv
import io

def profile_to_csv(profile: dict) -> str:
    output=io.StringIO()
    writer=csv.writer(output)
    writer.writerow(["field","value"])
    for key,value in profile.items():
        if isinstance(value,list):
            for i,item in enumerate(value,1):
                if isinstance(item,dict):
                    for subkey,subvalue in item.items(): writer.writerow([f"{key}.{i}.{subkey}",subvalue])
                else: writer.writerow([f"{key}.{i}",item])
        else: writer.writerow([key,value])
    return output.getvalue()
